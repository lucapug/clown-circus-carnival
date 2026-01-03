import { Button } from '@/components/ui/button';
import { LeaderboardEntry } from '@/types/game';

interface StartScreenProps {
  onStart: () => void;
  leaderboard: LeaderboardEntry[];
}

export const StartScreen = ({ onStart, leaderboard }: StartScreenProps) => {
  return (
    <div className="absolute inset-0 bg-background/95 flex items-center justify-center z-10">
      <div className="text-center max-w-lg mx-4">
        <h1 className="text-5xl font-bold rainbow-text mb-2 pixel-font">
          CIRCUS
        </h1>
        <h2 className="text-2xl rainbow-gradient mb-8 pixel-font">
          CLOWNS
        </h2>

        <div className="bg-card p-6 rounded-lg arcade-border mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4 pixel-font">HOW TO PLAY</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              <span>Move mouse to control the seesaw</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              <span>Click to launch a clown into the air</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              <span>Pop balloons for points!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">→</span>
              <span>Catch falling clowns or lose a life</span>
            </li>
          </ul>
          
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-bold text-foreground mb-2 pixel-font">SCORING</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-balloon-yellow"></div>
                <span className="text-muted-foreground">Yellow: 20 pts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-balloon-green"></div>
                <span className="text-muted-foreground">Green: 50 pts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-balloon-blue"></div>
                <span className="text-muted-foreground">Blue: 100 pts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary text-lg">★</span>
                <span className="text-muted-foreground">Clear row = Bonus!</span>
              </div>
            </div>
          </div>
        </div>

        {leaderboard.length > 0 && (
          <div className="bg-card p-4 rounded-lg arcade-border mb-8">
            <h3 className="text-sm font-bold text-accent mb-2 pixel-font">HIGH SCORES</h3>
            <div className="space-y-1">
              {leaderboard.slice(0, 3).map((entry, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className={i === 0 ? 'text-primary' : 'text-muted-foreground'}>
                    {entry.name}
                  </span>
                  <span className={i === 0 ? 'text-primary' : 'text-muted-foreground'}>
                    {entry.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={onStart} 
          size="lg"
          className="text-lg px-12 py-6 pixel-font animate-pulse-glow"
        >
          START GAME
        </Button>
        
        <p className="text-xs text-muted-foreground mt-4">
          Click or press SPACE to begin
        </p>
      </div>
    </div>
  );
};
