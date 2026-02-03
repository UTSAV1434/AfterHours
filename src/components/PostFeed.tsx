import { Loader2 } from 'lucide-react';
import type { Post } from '../App';
import { PostCard } from './PostCard';

interface PostFeedProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  onReaction: (postId: string, emoji: string, previousEmoji: string | null) => void;
  onDelete: (postId: string) => void;
}

export function PostFeed({ posts, loading, error, onReaction, onDelete }: PostFeedProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-12 shadow-lg border border-border flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading thoughts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-lg border border-destructive/30">
        <p className="text-destructive text-center">Error: {error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-card rounded-xl p-12 shadow-lg border border-border">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💭</span>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No thoughts yet</h3>
          <p className="text-muted-foreground text-sm">
            Be the first to share your late-night thoughts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          {posts.length} {posts.length === 1 ? 'thought' : 'thoughts'} shared tonight
        </h2>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live updates" />
      </div>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} onReaction={onReaction} onDelete={onDelete} />
      ))}
    </div>
  );
}