import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeaderboardEntry } from '@/types/game';

interface GameOverProps {
  score: number;
  onRestart: () => void;
  onSaveScore: (name: string, score: number) => void;
  leaderboard: LeaderboardEntry[];
}

export const GameOver = ({ score, onRestart, onSaveScore, leaderboard }: GameOverProps) => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      onSaveScore(name.trim(), score);
      setSaved(true);
    }
  };

  return (
    <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-10">
      <div className="bg-card p-8 rounded-lg arcade-border text-center max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-destructive arcade-text mb-4 pixel-font animate-pulse-glow">
          GAME OVER
        </h2>
        
        <div className="mb-6">
          <div className="text-muted-foreground text-sm uppercase tracking-wider">Final Score</div>
          <div className="text-4xl font-bold text-primary arcade-text pixel-font">
            {score.toString().padStart(6, '0')}
          </div>
        </div>

        {!saved ? (
          <div className="mb-6 space-y-3">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 10))}
              maxLength={10}
              className="text-center bg-muted border-border text-foreground pixel-font"
            />
            <Button 
              onClick={handleSave} 
              disabled={!name.trim()}
              className="w-full pixel-font"
            >
              Save Score
            </Button>
          </div>
        ) : (
          <div className="mb-6 text-accent pixel-font">Score Saved!</div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-bold text-accent mb-3 pixel-font">Leaderboard</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div 
                key={i} 
                className={`flex justify-between px-3 py-1 rounded ${
                  i === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className="pixel-font text-sm">{i + 1}. {entry.name}</span>
                <span className="pixel-font text-sm">{entry.score}</span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="text-muted-foreground text-sm">No scores yet</div>
            )}
          </div>
        </div>

        <Button 
          onClick={onRestart} 
          variant="default"
          size="lg"
          className="w-full pixel-font animate-pulse-glow"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};
