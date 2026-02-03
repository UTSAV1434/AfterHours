import { useState } from 'react';
import { Send, AlertCircle, Clock, Sun, Moon } from 'lucide-react';

interface PostComposerProps {
  onSubmit: (content: string, category: string, isNightThought: boolean) => Promise<{ success: boolean; error?: string }>;
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
  const [activeTab, setActiveTab] = useState<'anytime' | 'night'>('anytime');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingChars = MAX_CHARACTERS - content.length;
  const isOverLimit = remainingChars < 0;

  const isNightHours = () => {
    const hours = new Date().getHours();
    return hours >= 0 && hours < 6; // 12 AM to 5:59 AM
  };

  const canPost = () => {
    if (activeTab === 'anytime') return true;
    return isNightHours();
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

    if (!canPost()) {
      setError('Night Thoughts can only be posted between 12 AM and 6 AM');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await onSubmit(content, category, activeTab === 'night');

    if (result.success) {
      setContent('');
      setCategory('general');
    } else {
      setError(result.error || 'Failed to post');
    }

    setIsSubmitting(false);
  };

  const handleTabChange = (tab: 'anytime' | 'night') => {
    setActiveTab(tab);
    setError(null);
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => handleTabChange('anytime')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all ${activeTab === 'anytime'
              ? 'bg-primary/10 text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:bg-muted/50'
            }`}
        >
          <Sun className="w-4 h-4" />
          Anytime
        </button>
        <button
          onClick={() => handleTabChange('night')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all ${activeTab === 'night'
              ? 'bg-primary/10 text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:bg-muted/50'
            }`}
        >
          <Moon className="w-4 h-4" />
          Night Thoughts
          {!isNightHours() && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-muted rounded-full">
              12AM-6AM
            </span>
          )}
        </button>
      </div>

      <div className="p-6">
        {/* Tab Info */}
        <div className="flex items-center gap-2 mb-4">
          {activeTab === 'anytime' ? (
            <>
              <Sun className="w-5 h-5 text-yellow-500" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Anytime Thoughts</h2>
                <p className="text-xs text-muted-foreground">Share your thoughts whenever you want</p>
              </div>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Night Thoughts</h2>
                <p className="text-xs text-muted-foreground">
                  {isNightHours()
                    ? 'Share your late-night reflections'
                    : 'Available between 12 AM and 6 AM'}
                </p>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Night hours indicator */}
          {activeTab === 'night' && !isNightHours() && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Come back between <strong>12 AM – 6 AM</strong> to share your night thoughts
              </p>
            </div>
          )}

          {/* Textarea */}
          <div>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              placeholder={activeTab === 'night'
                ? "What's keeping you up tonight?"
                : "What's on your mind?"}
              className={`w-full h-32 bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${!canPost() ? 'opacity-50' : ''
                }`}
              disabled={isSubmitting || !canPost()}
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
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${category === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  disabled={isSubmitting || !canPost()}
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
            disabled={isSubmitting || !content.trim() || isOverLimit || !canPost()}
            className={`w-full font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'night'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {activeTab === 'night' ? 'Share Night Thought' : 'Post Thought'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}