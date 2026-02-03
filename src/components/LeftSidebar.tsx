import { Moon, Clock } from 'lucide-react';

export function LeftSidebar() {
  const isOpen = () => {
    // Temporarily disabled for testing - always return true
    // const hours = new Date().getHours();
    // return hours >= 12 && hours < 18; // 12 PM to 5:59 PM
    return true;
  };

  return (
    <div className="space-y-6">
      {/* App Info Card */}
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Moon className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Night Thoughts</h1>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          A safe space for your afternoon thoughts. Share anonymously between 12 PM – 5 PM.
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Status</h3>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOpen() ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className={`text-sm font-medium ${isOpen() ? 'text-green-400' : 'text-red-400'}`}>
            {isOpen() ? 'Open' : 'Closed'}
          </span>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          {isOpen() 
            ? 'Share your thoughts now'
            : 'Come back between 12 PM – 5 PM'}
        </p>
      </div>

      {/* Tagline Card */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
        <p className="text-sm text-foreground/90 italic leading-relaxed">
          "Sometimes the quietest hours hold the loudest thoughts."
        </p>
      </div>
    </div>
  );
}