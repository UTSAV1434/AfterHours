import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { containsBadWords } from './utils/badWords';
import { PostComposer } from './components/PostComposer';
import { PostFeed } from './components/PostFeed';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';

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

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, totalReactions: 0, topPost: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-70a0f2b1`;

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
    fetchPosts();
    fetchStats();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchPosts();
      fetchStats();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Create post
  const handleCreatePost = async (content: string, category: string) => {
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
        body: JSON.stringify({ content, category }),
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
    <div className="min-h-screen bg-background">
      {/* Gradient overlay for night theme */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/10" />
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