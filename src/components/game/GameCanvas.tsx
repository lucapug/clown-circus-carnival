import { useEffect, useRef } from 'react';
import { GameState } from '@/types/game';

interface GameCanvasProps {
  gameState: GameState;
  width: number;
  height: number;
  onMouseMove: (x: number) => void;
  onClick: () => void;
}

export const GameCanvas = ({ gameState, width, height, onMouseMove, onClick }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(240, 20%, 4%)';
    ctx.fillRect(0, 0, width, height);

    // Draw arcade border
    ctx.strokeStyle = 'hsl(270, 50%, 40%)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Inner glow border
    ctx.strokeStyle = 'hsl(330, 100%, 60%)';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    // Draw balloons
    gameState.balloons.forEach(balloon => {
      if (balloon.popped) return;

      ctx.save();
      
      const colors = {
        yellow: { main: 'hsl(50, 100%, 55%)', glow: 'hsl(50, 100%, 70%)' },
        green: { main: 'hsl(140, 80%, 45%)', glow: 'hsl(140, 80%, 60%)' },
        blue: { main: 'hsl(210, 100%, 55%)', glow: 'hsl(210, 100%, 70%)' },
      };

      const { main, glow } = colors[balloon.color];

      // Glow effect
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;

      // Balloon body
      ctx.beginPath();
      ctx.arc(balloon.x, balloon.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = main;
      ctx.fill();

      // Balloon highlight
      ctx.beginPath();
      ctx.arc(balloon.x - 4, balloon.y - 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      // Balloon string
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(balloon.x, balloon.y + 16);
      ctx.lineTo(balloon.x, balloon.y + 24);
      ctx.strokeStyle = main;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    });

    // Draw seesaw
    const { seesaw } = gameState;
    ctx.save();
    
    // Seesaw base (triangle)
    ctx.fillStyle = 'hsl(270, 60%, 30%)';
    ctx.beginPath();
    ctx.moveTo(seesaw.x - 20, seesaw.y + 30);
    ctx.lineTo(seesaw.x + 20, seesaw.y + 30);
    ctx.lineTo(seesaw.x, seesaw.y);
    ctx.closePath();
    ctx.fill();

    // Seesaw board
    ctx.translate(seesaw.x, seesaw.y);
    const tiltAngle = seesaw.tilt === 'left' ? -0.15 : seesaw.tilt === 'right' ? 0.15 : 0;
    ctx.rotate(tiltAngle);
    
    ctx.fillStyle = 'hsl(0, 0%, 75%)';
    ctx.shadowColor = 'hsl(330, 100%, 60%)';
    ctx.shadowBlur = 5;
    ctx.fillRect(-seesaw.width / 2, -5, seesaw.width, 10);
    
    ctx.restore();

    // Draw clowns
    gameState.clowns.forEach(clown => {
      ctx.save();
      ctx.translate(clown.x, clown.y);

      // Body
      ctx.fillStyle = 'hsl(40, 80%, 65%)';
      ctx.shadowColor = 'hsl(330, 100%, 60%)';
      ctx.shadowBlur = 8;
      
      // Head
      ctx.beginPath();
      ctx.arc(0, -8, 10, 0, Math.PI * 2);
      ctx.fill();

      // Body (torso)
      ctx.fillStyle = 'hsl(330, 80%, 50%)';
      ctx.fillRect(-6, 0, 12, 14);

      // Arms (up if flying)
      ctx.fillStyle = 'hsl(40, 80%, 65%)';
      if (clown.isFlying) {
        ctx.fillRect(-12, -5, 6, 4);
        ctx.fillRect(6, -5, 6, 4);
      } else {
        ctx.fillRect(-12, 4, 6, 4);
        ctx.fillRect(6, 4, 6, 4);
      }

      // Legs
      ctx.fillStyle = 'hsl(210, 80%, 45%)';
      ctx.fillRect(-5, 14, 4, 8);
      ctx.fillRect(1, 14, 4, 8);

      // Face
      ctx.fillStyle = 'hsl(0, 0%, 10%)';
      ctx.beginPath();
      ctx.arc(-3, -10, 2, 0, Math.PI * 2);
      ctx.arc(3, -10, 2, 0, Math.PI * 2);
      ctx.fill();

      // Red nose
      ctx.fillStyle = 'hsl(0, 80%, 50%)';
      ctx.beginPath();
      ctx.arc(0, -6, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Draw floating texts
    gameState.floatingTexts.forEach(ft => {
      const age = Date.now() - ft.createdAt;
      const opacity = 1 - age / 1000;
      const yOffset = age / 20;
      
      ctx.save();
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.fillStyle = `rgba(255, 255, 100, ${opacity})`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(255, 200, 0, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(ft.text, ft.x, ft.y - yOffset);
      ctx.restore();
    });

    // Draw ground line
    ctx.strokeStyle = 'hsl(270, 50%, 30%)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();

  }, [gameState, width, height]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    onMouseMove(x);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className="border-2 border-border rounded-lg cursor-crosshair max-w-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
