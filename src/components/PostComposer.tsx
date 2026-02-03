import { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';

interface PostComposerProps {
  onSubmit: (content: string, category: string) => Promise<{ success: boolean; error?: string }>;
}

const CATEGORIES = [
  { id: 'general', label: 'General', emoji: '💭' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
  { id: 'hope', label: 'Hope', emoji: '✨' },
  { id: 'gratitude', label: 'Gratitude', emoji: '🙏' },
  { id: 'loneliness', label: 'Loneliness', emoji: '🌙' },
  { id: 'reflection', label: 'Reflection', emoji: '🪞' },
];

const MAX_CHARACTERS = 200;

export function PostComposer({ onSubmit }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingChars = MAX_CHARACTERS - content.length;
  const isOverLimit = remainingChars < 0;

  const isInPostingWindow = () => {
    // Temporarily disabled for testing - always return true
    // const hours = new Date().getHours();
    // return hours >= 12 && hours < 18; // 12 PM to 5:59 PM
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please write something');
      return;
    }

    if (isOverLimit) {
      setError('Your thought is too long');
      return;
    }

    if (!isInPostingWindow()) {
      setError('Posting is only available between 12 PM and 5 PM');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await onSubmit(content, category);

    if (result.success) {
      setContent('');
      setCategory('general');
    } else {
      setError(result.error || 'Failed to post');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4">Share Your Thoughts</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Textarea */}
        <div>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            placeholder="What's on your mind tonight?"
            className="w-full h-32 bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={isSubmitting || !isInPostingWindow()}
          />
          
          {/* Character counter */}
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        {/* Category selection */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  category === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted'
                }`}
                disabled={isSubmitting}
              >
                <span className="mr-1">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || isOverLimit || !isInPostingWindow()}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Post Thought
            </>
          )}
        </button>

        {!isInPostingWindow() && (
          <p className="text-xs text-center text-muted-foreground">
            Posting is available between 12 PM and 5 PM
          </p>
        )}
      </form>
    </div>
  );
}