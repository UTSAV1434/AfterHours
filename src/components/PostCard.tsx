import { useState, useEffect } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import type { Post } from '../App';

interface PostCardProps {
  post: Post;
  onReaction: (postId: string, emoji: string, previousEmoji: string | null) => void;
  onDelete: (postId: string) => void;
}

const REACTION_EMOJIS = ['💙', '🌙', '✨', '🫂', '💭'];

// Generate or get a unique user ID for this session
const getUserId = () => {
  let userId = localStorage.getItem('night_thoughts_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('night_thoughts_user_id', userId);
  }
  return userId;
};

export function PostCard({ post, onReaction, onDelete }: PostCardProps) {
  const [userReaction, setUserReaction] = useState<string | null>(null);

  // Load user's reaction for this post from localStorage
  useEffect(() => {
    const savedReaction = localStorage.getItem(`reaction_${post.id}`);
    setUserReaction(savedReaction);
  }, [post.id]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this thought?')) {
      onDelete(post.id);
    }
  };

  const handleReaction = (emoji: string) => {
    const previousEmoji = userReaction;

    // If clicking the same emoji, remove the reaction (toggle off)
    if (previousEmoji === emoji) {
      setUserReaction(null);
      localStorage.removeItem(`reaction_${post.id}`);
      onReaction(post.id, emoji, previousEmoji);
    } else {
      // Switch to new reaction
      setUserReaction(emoji);
      localStorage.setItem(`reaction_${post.id}`, emoji);
      onReaction(post.id, emoji, previousEmoji);
    }
  };

  const getTotalReactions = () => {
    if (!post.reactions) return 0;
    return Object.values(post.reactions).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border hover:border-primary/30 transition-all group">
      {/* Category badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {post.category}
          </span>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(post.timestamp)}
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
          title="Delete thought"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Post content */}
      <p className="text-foreground leading-relaxed mb-4 text-base">
        {post.content}
      </p>

      {/* Reactions */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          {/* Reaction buttons */}
          <div className="flex items-center gap-2">
            {REACTION_EMOJIS.map((emoji) => {
              const count = post.reactions?.[emoji] || 0;
              const isUserReaction = userReaction === emoji;

              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all hover:bg-primary/10 hover:scale-110 ${isUserReaction ? 'bg-primary/20 scale-110 ring-2 ring-primary/40' : 'bg-background'
                    } ${count > 0 ? 'border border-primary/20' : 'border border-transparent'}`}
                  title={isUserReaction ? `Remove ${emoji} reaction` : `React with ${emoji}`}
                >
                  <span className="text-sm">{emoji}</span>
                  {count > 0 && (
                    <span className={`text-xs font-medium ${isUserReaction ? 'text-primary' : 'text-muted-foreground'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Total reactions */}
          {getTotalReactions() > 0 && (
            <span className="text-xs text-muted-foreground">
              {getTotalReactions()} {getTotalReactions() === 1 ? 'reaction' : 'reactions'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}