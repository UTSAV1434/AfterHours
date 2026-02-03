import { TrendingUp, Heart, MessageCircle, Sparkles } from 'lucide-react';
import type { Stats } from '../App';

interface RightSidebarProps {
  stats: Stats;
}

export function RightSidebar({ stats }: RightSidebarProps) {
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getTotalReactions = (post: any) => {
    if (!post?.reactions) return 0;
    return Object.values(post.reactions).reduce((sum: number, count: any) => sum + count, 0);
  };

  return (
    <div className="space-y-6">
      {/* Top Post Card */}
      {stats.topPost && (
        <div className="bg-card rounded-xl p-6 shadow-lg border border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Top Thought of the Night</h3>
          </div>
          
          <div className="bg-background/50 rounded-lg p-4 mb-3">
            <p className="text-sm text-foreground leading-relaxed">
              {stats.topPost.content}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full">
              {stats.topPost.category}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {getTotalReactions(stats.topPost)}
              </span>
              <span>{formatTimeAgo(stats.topPost.timestamp)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Night Stats Card */}
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Tonight's Stats</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Thoughts</span>
            <span className="text-lg font-semibold text-foreground">{stats.totalPosts}</span>
          </div>
          
          <div className="h-px bg-border" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Reactions</span>
            <span className="text-lg font-semibold text-foreground">{stats.totalReactions}</span>
          </div>
        </div>
      </div>

      {/* Mental Health Message Card */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Remember</h3>
        </div>
        
        <p className="text-xs text-foreground/80 leading-relaxed">
          You're not alone in your late-night thoughts. If you're struggling, consider reaching out to a mental health professional or crisis helpline.
        </p>
        
        <div className="mt-4 pt-4 border-t border-primary/20">
          <a 
            href="https://988lifeline.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Crisis Support: 988 Lifeline →
          </a>
        </div>
      </div>
    </div>
  );
}
