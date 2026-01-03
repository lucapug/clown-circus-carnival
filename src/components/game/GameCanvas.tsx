import { useEffect, useRef } from 'react';
import { GameState } from '@/types/game';
import { DIVING_BOARDS } from '@/hooks/useGameEngine';

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

    // Draw arcade border with rainbow effect
    const time = Date.now() / 1000;
    const hue = (time * 60) % 360;
    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Inner glow border
    ctx.strokeStyle = `hsl(${(hue + 180) % 360}, 100%, 60%)`;
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

    // Draw stylized seesaw
    const { seesaw } = gameState;
    ctx.save();
    
    // Seesaw base (decorative circus pedestal)
    const baseGradient = ctx.createLinearGradient(seesaw.x - 25, seesaw.y, seesaw.x + 25, seesaw.y + 40);
    baseGradient.addColorStop(0, 'hsl(45, 80%, 55%)');
    baseGradient.addColorStop(0.5, 'hsl(30, 70%, 40%)');
    baseGradient.addColorStop(1, 'hsl(20, 60%, 30%)');
    
    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.moveTo(seesaw.x - 30, seesaw.y + 35);
    ctx.lineTo(seesaw.x + 30, seesaw.y + 35);
    ctx.lineTo(seesaw.x + 20, seesaw.y + 5);
    ctx.lineTo(seesaw.x - 20, seesaw.y + 5);
    ctx.closePath();
    ctx.fill();
    
    // Decorative stripes on base
    ctx.fillStyle = 'hsl(0, 70%, 50%)';
    ctx.fillRect(seesaw.x - 15, seesaw.y + 10, 6, 20);
    ctx.fillRect(seesaw.x + 9, seesaw.y + 10, 6, 20);
    
    // Pivot ball
    ctx.fillStyle = 'hsl(45, 90%, 60%)';
    ctx.shadowColor = 'hsl(45, 100%, 70%)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(seesaw.x, seesaw.y + 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Seesaw board with tilt
    ctx.translate(seesaw.x, seesaw.y);
    const tiltAngle = seesaw.tilt === 'left' ? -0.15 : seesaw.tilt === 'right' ? 0.15 : 0;
    ctx.rotate(tiltAngle);
    
    // Board gradient
    const boardGradient = ctx.createLinearGradient(-seesaw.width / 2, -8, seesaw.width / 2, 8);
    boardGradient.addColorStop(0, 'hsl(0, 70%, 55%)');
    boardGradient.addColorStop(0.5, 'hsl(45, 80%, 60%)');
    boardGradient.addColorStop(1, 'hsl(0, 70%, 55%)');
    
    ctx.fillStyle = boardGradient;
    ctx.shadowColor = 'hsl(45, 100%, 70%)';
    ctx.shadowBlur = 10;
    
    // Rounded board
    ctx.beginPath();
    ctx.roundRect(-seesaw.width / 2, -6, seesaw.width, 12, 4);
    ctx.fill();
    
    // Board stripes (circus style)
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'hsl(0, 0%, 100%)';
    for (let i = -seesaw.width / 2 + 15; i < seesaw.width / 2 - 10; i += 20) {
      ctx.fillRect(i, -4, 8, 8);
    }
    
    // Landing zone indicators
    ctx.fillStyle = 'hsl(120, 70%, 45%)';
    ctx.fillRect(-seesaw.width / 2 + 2, -6, 8, 12);
    ctx.fillRect(seesaw.width / 2 - 10, -6, 8, 12);
    
    ctx.restore();

    // Draw stylized clowns
    gameState.clowns.forEach(clown => {
      ctx.save();
      ctx.translate(clown.x, clown.y);

      // Clown shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 24, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Big clown shoes
      ctx.fillStyle = 'hsl(0, 80%, 50%)';
      ctx.beginPath();
      ctx.ellipse(-8, 22, 10, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, 22, 10, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Baggy pants
      ctx.fillStyle = 'hsl(45, 90%, 55%)';
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.quadraticCurveTo(-14, 15, -10, 20);
      ctx.lineTo(10, 20);
      ctx.quadraticCurveTo(14, 15, 10, 8);
      ctx.closePath();
      ctx.fill();
      
      // Pants stripes
      ctx.fillStyle = 'hsl(0, 70%, 50%)';
      ctx.fillRect(-6, 8, 3, 12);
      ctx.fillRect(3, 8, 3, 12);

      // Colorful body/shirt
      const shirtGradient = ctx.createLinearGradient(-8, -2, 8, 10);
      shirtGradient.addColorStop(0, 'hsl(280, 70%, 55%)');
      shirtGradient.addColorStop(0.5, 'hsl(320, 70%, 55%)');
      shirtGradient.addColorStop(1, 'hsl(280, 70%, 55%)');
      ctx.fillStyle = shirtGradient;
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(-10, -2);
      ctx.quadraticCurveTo(0, -6, 10, -2);
      ctx.lineTo(8, 8);
      ctx.closePath();
      ctx.fill();
      
      // Big buttons
      ctx.fillStyle = 'hsl(45, 100%, 60%)';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.arc(0, 5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Arms with gloves
      ctx.fillStyle = 'hsl(280, 70%, 55%)';
      if (clown.isFlying) {
        // Arms up (flying pose)
        ctx.beginPath();
        ctx.moveTo(-10, -2);
        ctx.quadraticCurveTo(-18, -15, -14, -20);
        ctx.lineTo(-10, -18);
        ctx.quadraticCurveTo(-12, -10, -8, -2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, -2);
        ctx.quadraticCurveTo(18, -15, 14, -20);
        ctx.lineTo(10, -18);
        ctx.quadraticCurveTo(12, -10, 8, -2);
        ctx.fill();
        // White gloves
        ctx.fillStyle = 'hsl(0, 0%, 100%)';
        ctx.beginPath();
        ctx.arc(-14, -20, 5, 0, Math.PI * 2);
        ctx.arc(14, -20, 5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Arms down
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.quadraticCurveTo(-16, 5, -14, 12);
        ctx.lineTo(-10, 10);
        ctx.quadraticCurveTo(-10, 5, -8, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.quadraticCurveTo(16, 5, 14, 12);
        ctx.lineTo(10, 10);
        ctx.quadraticCurveTo(10, 5, 8, 0);
        ctx.fill();
        // White gloves
        ctx.fillStyle = 'hsl(0, 0%, 100%)';
        ctx.beginPath();
        ctx.arc(-14, 12, 5, 0, Math.PI * 2);
        ctx.arc(14, 12, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Head with skin tone
      ctx.fillStyle = 'hsl(30, 70%, 80%)';
      ctx.shadowColor = 'hsl(45, 100%, 70%)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, -14, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Colorful wig/hair
      ctx.fillStyle = 'hsl(30, 100%, 50%)';
      ctx.beginPath();
      ctx.arc(-10, -20, 6, 0, Math.PI * 2);
      ctx.arc(10, -20, 6, 0, Math.PI * 2);
      ctx.arc(0, -24, 7, 0, Math.PI * 2);
      ctx.arc(-6, -22, 5, 0, Math.PI * 2);
      ctx.arc(6, -22, 5, 0, Math.PI * 2);
      ctx.fill();

      // Face - eyes
      ctx.fillStyle = 'hsl(0, 0%, 100%)';
      ctx.beginPath();
      ctx.ellipse(-5, -16, 4, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(5, -16, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'hsl(200, 80%, 40%)';
      ctx.beginPath();
      ctx.arc(-5, -15, 2, 0, Math.PI * 2);
      ctx.arc(5, -15, 2, 0, Math.PI * 2);
      ctx.fill();

      // Big red nose
      ctx.fillStyle = 'hsl(0, 80%, 50%)';
      ctx.shadowColor = 'hsl(0, 100%, 60%)';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(0, -10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Smile
      ctx.strokeStyle = 'hsl(0, 70%, 45%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -8, 8, 0.2, Math.PI - 0.2);
      ctx.stroke();

      // Rosy cheeks
      ctx.fillStyle = 'hsla(350, 80%, 70%, 0.5)';
      ctx.beginPath();
      ctx.ellipse(-10, -10, 3, 2, 0, 0, Math.PI * 2);
      ctx.ellipse(10, -10, 3, 2, 0, 0, Math.PI * 2);
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

    // Draw stylized diving boards (circus trampolines)
    const boardWidth = 70;
    const boardHeight = 10;
    
    DIVING_BOARDS.forEach((board, index) => {
      ctx.save();
      
      // Decorative support pole with circus stripes
      const poleX = board.side === 'left' ? 12 : width - 27;
      const stripeHeight = 20;
      
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'hsl(0, 70%, 50%)' : 'hsl(0, 0%, 95%)';
        ctx.fillRect(poleX, board.y - 40 + i * stripeHeight, 15, stripeHeight);
      }
      
      // Gold decorative rings on pole
      ctx.fillStyle = 'hsl(45, 90%, 55%)';
      ctx.fillRect(poleX - 2, board.y - 42, 19, 4);
      ctx.fillRect(poleX - 2, board.y + 58, 19, 4);
      
      // Diving board platform with gradient
      const platformX = board.side === 'left' ? 22 : width - 22 - boardWidth;
      const platformGradient = ctx.createLinearGradient(platformX, board.y - boardHeight, platformX + boardWidth, board.y + boardHeight);
      platformGradient.addColorStop(0, 'hsl(200, 70%, 55%)');
      platformGradient.addColorStop(0.5, 'hsl(180, 60%, 50%)');
      platformGradient.addColorStop(1, 'hsl(200, 70%, 55%)');
      
      ctx.fillStyle = platformGradient;
      ctx.shadowColor = 'hsl(180, 100%, 60%)';
      ctx.shadowBlur = 10;
      
      // Rounded platform
      ctx.beginPath();
      ctx.roundRect(platformX, board.y - boardHeight / 2, boardWidth, boardHeight, 3);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Platform stripes
      ctx.fillStyle = 'hsl(45, 90%, 60%)';
      const stripeStart = board.side === 'left' ? platformX + 5 : platformX + boardWidth - 15;
      for (let i = 0; i < 3; i++) {
        const offset = board.side === 'left' ? i * 12 : -i * 12;
        ctx.fillRect(stripeStart + offset, board.y - boardHeight / 2 + 2, 4, boardHeight - 4);
      }
      
      // Jump zone indicator (spring effect)
      const jumpZoneX = board.side === 'left' ? platformX + boardWidth - 18 : platformX + 8;
      ctx.fillStyle = 'hsl(120, 70%, 50%)';
      ctx.shadowColor = 'hsl(120, 100%, 60%)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(jumpZoneX, board.y - boardHeight / 2 - 2, 12, boardHeight + 4, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Small decorative flag on top
      ctx.fillStyle = 'hsl(0, 70%, 50%)';
      const flagX = board.side === 'left' ? poleX + 7 : poleX + 8;
      ctx.beginPath();
      ctx.moveTo(flagX, board.y - 50);
      ctx.lineTo(flagX + (board.side === 'left' ? 15 : -15), board.y - 42);
      ctx.lineTo(flagX, board.y - 34);
      ctx.closePath();
      ctx.fill();
      
      // Flag pole
      ctx.fillStyle = 'hsl(45, 80%, 50%)';
      ctx.fillRect(flagX - 1, board.y - 55, 3, 20);
      
      ctx.restore();
    });

    // Draw decorative ground with circus pattern
    ctx.fillStyle = 'hsl(30, 50%, 25%)';
    ctx.fillRect(20, height - 45, width - 40, 25);
    
    // Ground stripes
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'hsl(0, 60%, 40%)' : 'hsl(45, 70%, 50%)';
      ctx.fillRect(20 + i * ((width - 40) / 20), height - 45, (width - 40) / 20, 25);
    }
    
    // Ground border
    ctx.strokeStyle = 'hsl(45, 80%, 60%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, height - 45);
    ctx.lineTo(width - 20, height - 45);
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
