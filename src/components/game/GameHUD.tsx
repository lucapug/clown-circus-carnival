interface GameHUDProps {
  score: number;
  lives: number;
  bonusJumps: number;
}

export const GameHUD = ({ score, lives, bonusJumps }: GameHUDProps) => {
  return (
    <div className="flex justify-between items-center w-full max-w-[800px] px-4 py-2 bg-card rounded-lg arcade-border">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
          <div className="text-2xl font-bold text-primary arcade-text pixel-font">
            {score.toString().padStart(6, '0')}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Jumps</div>
          <div className="text-xl font-bold text-accent pixel-font">
            {bonusJumps}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider mr-2">Lives</span>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full transition-all duration-300 ${
              i < lives 
                ? 'bg-primary shadow-[0_0_10px_hsl(var(--primary))]' 
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
