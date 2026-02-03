import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { containsBadWords } from './utils/badWords';
import { useAuth } from './utils/AuthContext';
import { PostComposer } from './components/PostComposer';
import { PostFeed } from './components/PostFeed';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { LoginPage } from './components/LoginPage';
import { AdminPage } from './components/AdminPage';

export interface Post {
  id: string;
  content: string;
  category: string;
  timestamp: number;
  reactions: {
    [emoji: string]: number;
  };
}

export interface Stats {
  totalPosts: number;
  totalReactions: number;
  topPost: Post | null;
}

interface Timings {
  postingWindowStart: number;
  postingWindowEnd: number;
  nightModeStart: number;
  nightModeEnd: number;
}

function MainApp() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, totalReactions: 0, topPost: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timings, setTimings] = useState<Timings>({
    postingWindowStart: 0,
    postingWindowEnd: 5,
    nightModeStart: 0,
    nightModeEnd: 6,
  });
  const [isNightTime, setIsNightTime] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check if current hour is within a time range (handles ranges that cross midnight)
  const isInTimeRange = (currentHour: number, start: number, end: number) => {
    if (start <= end) {
      return currentHour >= start && currentHour < end;
    } else {
      // Range crosses midnight (e.g., 22 to 6)
      return currentHour >= start || currentHour < end;
    }
  };

  // Check time for night mode based on server settings
  useEffect(() => {
    const checkTime = () => {
      const hour = new Date().getHours();
      setIsNightTime(isInTimeRange(hour, timings.nightModeStart, timings.nightModeEnd));
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [timings.nightModeStart, timings.nightModeEnd]);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-70a0f2b1`;

  // Fetch timing settings
  const fetchTimings = async () => {
    try {
      // Try local storage first
      const stored = localStorage.getItem('night_thoughts_timings');
      if (stored) {
        setTimings(JSON.parse(stored));
        return;
      }

      // Fallback to defaults if nothing in local storage
      setTimings({
        postingWindowStart: 0,
        postingWindowEnd: 5,
        nightModeStart: 0,
        nightModeEnd: 6
      });
    } catch (err) {
      console.error('Error fetching timings:', err);
    }
  };

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      setPosts(data.posts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTimings();
    fetchPosts();
    fetchStats();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchPosts();
      fetchStats();
    }, 10000);

    // Refresh timings every 5 minutes
    const timingsInterval = setInterval(fetchTimings, 300000);

    return () => {
      clearInterval(interval);
      clearInterval(timingsInterval);
    };
  }, []);

  // Create post
  const handleCreatePost = async (content: string, category: string, isNightThought: boolean = false) => {
    if (containsBadWords(content)) {
      return {
        success: false,
        error: 'Your post contains inappropriate language so it cannot be posted.',
      };
    }

    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, category, isNightThought }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      // Refresh posts and stats
      await fetchPosts();
      await fetchStats();

      return { success: true };
    } catch (err) {
      console.error('Error creating post:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create post',
      };
    }
  };

  // Add reaction
  const handleReaction = async (postId: string, emoji: string, previousEmoji: string | null) => {
    try {
      // Get or create user ID
      let userId = localStorage.getItem('night_thoughts_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('night_thoughts_user_id', userId);
      }

      const response = await fetch(`${API_BASE}/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji, userId, previousEmoji }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      // Refresh posts and stats
      await fetchPosts();
      await fetchStats();
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Optimistically remove post from UI
      setPosts((prev) => prev.filter((post) => post.id !== postId));

      // Refresh stats
      await fetchStats();
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: isNightTime ? 'linear-gradient(to bottom, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%)' : '#000' }}>
      {/* Video background for daytime */}
      {!isNightTime && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <source src="/aesthetic-landscape-with-train.1920x1080.mp4" type="video/mp4" />
        </video>
      )}

      {/* Starry night background for nighttime */}
      {isNightTime && (
        <>
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(2px 2px at 20px 30px, white, transparent),
                radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                radial-gradient(1px 1px at 90px 40px, white, transparent),
                radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent),
                radial-gradient(1px 1px at 230px 80px, white, transparent),
                radial-gradient(2px 2px at 300px 150px, rgba(255,255,255,0.7), transparent),
                radial-gradient(1px 1px at 370px 60px, white, transparent),
                radial-gradient(2px 2px at 440px 200px, rgba(255,255,255,0.8), transparent),
                radial-gradient(1px 1px at 510px 90px, white, transparent),
                radial-gradient(2px 2px at 580px 170px, rgba(255,255,255,0.9), transparent),
                radial-gradient(1px 1px at 650px 50px, white, transparent),
                radial-gradient(2px 2px at 720px 140px, rgba(255,255,255,0.7), transparent)
              `,
              backgroundSize: '800px 600px',
              animation: 'twinkle 4s ease-in-out infinite',
            }}
          />
          <style>{`
            @keyframes twinkle {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            .shooting-star {
              position: absolute;
              width: 4px;
              height: 4px;
              background: white;
              border-radius: 50%;
              box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.6), 0 0 12px 4px rgba(105, 155, 255, 0.4);
              animation: shoot 2s ease-in-out infinite;
              opacity: 0;
              transform: rotate(-45deg);
            }
            .shooting-star::before {
              content: '';
              position: absolute;
              width: 120px;
              height: 2px;
              background: linear-gradient(to right, transparent, rgba(255,255,255,0.8));
              transform: translateX(4px) translateY(-50%);
              top: 50%;
            }
            @keyframes shoot {
              0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
              70% { opacity: 1; }
              100% { transform: translateX(-500px) translateY(500px) rotate(-45deg); opacity: 0; }
            }
          `}</style>
          <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            <div className="shooting-star" style={{ top: '10%', left: '70%', animationDelay: '0s' }} />
            <div className="shooting-star" style={{ top: '25%', left: '90%', animationDelay: '2s' }} />
            <div className="shooting-star" style={{ top: '5%', left: '60%', animationDelay: '4s' }} />
            <div className="shooting-star" style={{ top: '35%', left: '80%', animationDelay: '6s' }} />
            <div className="shooting-star" style={{ top: '15%', left: '50%', animationDelay: '8s' }} />
            <div className="shooting-star" style={{ top: '20%', left: '85%', animationDelay: '3s' }} />
            <div className="shooting-star" style={{ top: '30%', left: '75%', animationDelay: '5s' }} />
            <div className="shooting-star" style={{ top: '8%', left: '95%', animationDelay: '7s' }} />
          </div>
        </>
      )}

      {/* User bar */}
      <div className="relative z-10 flex justify-end items-center p-4 gap-3">
        {user ? (
          <>
            <span className="text-gray-300 text-sm">
              Welcome, <span className="text-indigo-400 font-medium">{user.displayName}</span>
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm rounded-lg text-white font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          >
            Sign In
          </button>
        )}
      </div>

      {/* Main container */}
      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* 3-column responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
          {/* Left Sidebar */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <LeftSidebar />
          </div>

          {/* Main Feed */}
          <div className="space-y-6">
            <PostComposer onSubmit={handleCreatePost} />
            <PostFeed
              posts={posts}
              loading={loading}
              error={error}
              onReaction={handleReaction}
              onDelete={handleDeletePost}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <RightSidebar stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}