import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  GameState, 
  Balloon, 
  Clown, 
  FloatingText,
  BALLOON_POINTS, 
  ROW_BONUS, 
  BOUNCE_POINTS 
} from '@/types/game';
import { useAudio } from './useAudio';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.3;
const BOUNCE_VELOCITY = -14;
const CLOWN_SIZE = 24;
const BALLOON_RADIUS = 16;
const SEESAW_WIDTH = 120;
const SEESAW_Y = CANVAS_HEIGHT - 80;
const BALLOON_ROWS = 4;
const BALLOONS_PER_ROW = 14;

const createBalloons = (): Balloon[] => {
  const balloons: Balloon[] = [];
  const colors: Balloon['color'][] = ['blue', 'green', 'green', 'yellow'];
  
  for (let row = 0; row < BALLOON_ROWS; row++) {
    const color = colors[row];
    const y = 60 + row * 40;
    
    for (let col = 0; col < BALLOONS_PER_ROW; col++) {
      const x = 80 + col * ((CANVAS_WIDTH - 160) / (BALLOONS_PER_ROW - 1));
      balloons.push({
        id: `${row}-${col}`,
        x,
        y,
        color,
        row,
        popped: false,
      });
    }
  }
  
  return balloons;
};

const createInitialClown = (side: 'left' | 'right'): Clown => ({
  x: side === 'left' ? CANVAS_WIDTH / 2 - SEESAW_WIDTH / 3 : CANVAS_WIDTH / 2 + SEESAW_WIDTH / 3,
  y: SEESAW_Y - CLOWN_SIZE,
  vx: 0,
  vy: 0,
  isFlying: false,
  isOnSeesaw: true,
  seesawSide: side,
});

const initialState: GameState = {
  score: 0,
  lives: 3,
  bonusJumps: 0,
  isPlaying: false,
  isGameOver: false,
  clowns: [createInitialClown('left'), createInitialClown('right')],
  balloons: createBalloons(),
  seesaw: {
    x: CANVAS_WIDTH / 2,
    y: SEESAW_Y,
    width: SEESAW_WIDTH,
    tilt: 'center',
  },
  floatingTexts: [],
};

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const animationRef = useRef<number>();
  const seesawXRef = useRef(CANVAS_WIDTH / 2);
  const { playPop, playBonus, playDeath, playBounce, playGameOver, startBackgroundMusic, stopBackgroundMusic } = useAudio();

  const addFloatingText = useCallback((text: string, x: number, y: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setGameState(prev => ({
      ...prev,
      floatingTexts: [...prev.floatingTexts, { id, text, x, y, createdAt: Date.now() }],
    }));
    
    // Remove after animation
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        floatingTexts: prev.floatingTexts.filter(ft => ft.id !== id),
      }));
    }, 1000);
  }, []);

  const checkRowCleared = useCallback((balloons: Balloon[], row: number, color: Balloon['color']) => {
    const rowBalloons = balloons.filter(b => b.row === row);
    const allPopped = rowBalloons.every(b => b.popped);
    
    if (allPopped) {
      const bonus = ROW_BONUS[color];
      playBonus();
      addFloatingText(`+${bonus} ROW BONUS!`, CANVAS_WIDTH / 2, 200);
      
      return {
        bonusPoints: bonus,
        extraJump: color === 'blue' ? 1 : 0,
      };
    }
    
    return { bonusPoints: 0, extraJump: 0 };
  }, [playBonus, addFloatingText]);

  const gameLoop = useCallback(() => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.isGameOver) return prev;
      
      const newClowns = prev.clowns.map(clown => {
        if (!clown.isFlying) return clown;
        
        let newClown = { ...clown };
        
        // Apply gravity
        newClown.vy += GRAVITY;
        newClown.x += newClown.vx;
        newClown.y += newClown.vy;
        
        // Bounce off walls
        if (newClown.x < CLOWN_SIZE) {
          newClown.x = CLOWN_SIZE;
          newClown.vx = Math.abs(newClown.vx) * 0.8;
        }
        if (newClown.x > CANVAS_WIDTH - CLOWN_SIZE) {
          newClown.x = CANVAS_WIDTH - CLOWN_SIZE;
          newClown.vx = -Math.abs(newClown.vx) * 0.8;
        }
        
        return newClown;
      });
      
      // Check balloon collisions
      let newBalloons = [...prev.balloons];
      let scoreGain = 0;
      let extraJumps = 0;
      
      newClowns.forEach(clown => {
        if (!clown.isFlying) return;
        
        newBalloons.forEach((balloon, idx) => {
          if (balloon.popped) return;
          
          const dx = clown.x - balloon.x;
          const dy = clown.y - balloon.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < CLOWN_SIZE + BALLOON_RADIUS) {
            newBalloons[idx] = { ...balloon, popped: true };
            scoreGain += BALLOON_POINTS[balloon.color];
            playPop();
            addFloatingText(`+${BALLOON_POINTS[balloon.color]}`, balloon.x, balloon.y);
            
            // Check if row is cleared
            const rowCheck = checkRowCleared(
              newBalloons, 
              balloon.row, 
              balloon.color
            );
            scoreGain += rowCheck.bonusPoints;
            extraJumps += rowCheck.extraJump;
          }
        });
      });
      
      // Check seesaw collision for flying clowns
      const seesawX = seesawXRef.current;
      let newLives = prev.lives;
      let livesLost = false;
      
      const processedClowns: Clown[] = newClowns.map((clown, idx) => {
        if (!clown.isFlying) return clown;
        
        // Check if clown is falling and at seesaw level
        if (clown.vy > 0 && clown.y >= SEESAW_Y - CLOWN_SIZE) {
          const seesawLeft = seesawX - SEESAW_WIDTH / 2;
          const seesawRight = seesawX + SEESAW_WIDTH / 2;
          const seesawCenter = seesawX;
          
          // Define the safe landing zones (where the other clown sits)
          // Left edge zone: from seesawLeft to seesawLeft + SEESAW_WIDTH/3
          // Right edge zone: from seesawRight - SEESAW_WIDTH/3 to seesawRight
          // Middle (death zone): everything else
          const edgeWidth = SEESAW_WIDTH / 3;
          const leftEdgeRight = seesawLeft + edgeWidth;
          const rightEdgeLeft = seesawRight - edgeWidth;
          
          // Check if clown hits the seesaw area
          if (clown.x >= seesawLeft && clown.x <= seesawRight) {
            // Check if landing on edges (safe) or middle (death)
            const isOnLeftEdge = clown.x >= seesawLeft && clown.x <= leftEdgeRight;
            const isOnRightEdge = clown.x >= rightEdgeLeft && clown.x <= seesawRight;
            const isOnEdge = isOnLeftEdge || isOnRightEdge;
            
            if (isOnEdge) {
              // Successful landing on edge!
              playBounce();
              scoreGain += BOUNCE_POINTS;
              addFloatingText(`+${BOUNCE_POINTS}`, clown.x, clown.y);
              
              const side: 'left' | 'right' = isOnLeftEdge ? 'left' : 'right';
              
              // Find the other clown on the seesaw and launch them
              const otherIdx = newClowns.findIndex((c, i) => 
                i !== idx && c.isOnSeesaw && c.seesawSide !== side
              );
              
              if (otherIdx !== -1) {
                newClowns[otherIdx] = {
                  ...newClowns[otherIdx],
                  isFlying: true,
                  isOnSeesaw: false,
                  vy: BOUNCE_VELOCITY,
                  vx: (Math.random() - 0.5) * 4,
                };
              }
              
              return {
                ...clown,
                isFlying: false,
                isOnSeesaw: true,
                seesawSide: side,
                y: SEESAW_Y - CLOWN_SIZE,
                x: side === 'left' ? seesawX - SEESAW_WIDTH / 4 : seesawX + SEESAW_WIDTH / 4,
                vx: 0,
                vy: 0,
              };
            } else {
              // Landing in the middle = death!
              newLives--;
              livesLost = true;
              playDeath();
              addFloatingText('SPLAT!', clown.x, SEESAW_Y - 30);
              
              // Reset clown to seesaw
              const existingSides = newClowns
                .filter((c, i) => i !== idx && c.isOnSeesaw)
                .map(c => c.seesawSide);
              const freeSide: 'left' | 'right' = !existingSides.includes('left') ? 'left' : 'right';
              
              return createInitialClown(freeSide);
            }
          }
        }
        
        // Check if clown fell off screen
        if (clown.y > CANVAS_HEIGHT + 50) {
          newLives--;
          livesLost = true;
          playDeath();
          addFloatingText('SPLAT!', clown.x, CANVAS_HEIGHT - 50);
          
          // Reset clown to seesaw
          const existingSides = newClowns
            .filter((c, i) => i !== idx && c.isOnSeesaw)
            .map(c => c.seesawSide);
          const freeSide = !existingSides.includes('left') ? 'left' : 'right';
          
          return createInitialClown(freeSide);
        }
        
        return clown;
      });
      
      // Check game over
      const isGameOver = newLives <= 0;
      if (isGameOver && !prev.isGameOver) {
        playGameOver();
        stopBackgroundMusic();
      }
      
      // Update seesaw position based on clowns
      let newTilt: 'left' | 'right' | 'center' = 'center';
      const clownsOnSeesaw = processedClowns.filter(c => c.isOnSeesaw);
      if (clownsOnSeesaw.length === 1) {
        newTilt = clownsOnSeesaw[0].seesawSide;
      }
      
      return {
        ...prev,
        clowns: processedClowns,
        balloons: newBalloons,
        score: prev.score + scoreGain,
        lives: newLives,
        bonusJumps: prev.bonusJumps + extraJumps,
        isGameOver,
        seesaw: {
          ...prev.seesaw,
          x: seesawX,
          tilt: newTilt,
        },
      };
    });
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [playPop, playBonus, playDeath, playBounce, playGameOver, stopBackgroundMusic, checkRowCleared, addFloatingText]);

  const moveSeesaw = useCallback((x: number) => {
    const clampedX = Math.max(SEESAW_WIDTH / 2, Math.min(CANVAS_WIDTH - SEESAW_WIDTH / 2, x));
    seesawXRef.current = clampedX;
    
    setGameState(prev => ({
      ...prev,
      seesaw: { ...prev.seesaw, x: clampedX },
      clowns: prev.clowns.map(clown => {
        if (!clown.isOnSeesaw) return clown;
        
        const offsetX = clown.seesawSide === 'left' ? -SEESAW_WIDTH / 4 : SEESAW_WIDTH / 4;
        return { ...clown, x: clampedX + offsetX };
      }),
    }));
  }, []);

  const startGame = useCallback(() => {
    setGameState({
      ...initialState,
      isPlaying: true,
      balloons: createBalloons(),
      clowns: [createInitialClown('left'), createInitialClown('right')],
    });
    seesawXRef.current = CANVAS_WIDTH / 2;
    startBackgroundMusic();
  }, [startBackgroundMusic]);

  const launchClown = useCallback(() => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.isGameOver) return prev;
      
      const clownToLaunch = prev.clowns.find(c => c.isOnSeesaw);
      if (!clownToLaunch) return prev;
      
      return {
        ...prev,
        clowns: prev.clowns.map(c => 
          c === clownToLaunch
            ? { ...c, isFlying: true, isOnSeesaw: false, vy: BOUNCE_VELOCITY, vx: (Math.random() - 0.5) * 4 }
            : c
        ),
      };
    });
    playBounce();
  }, [playBounce]);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isGameOver) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isGameOver, gameLoop]);

  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, [stopBackgroundMusic]);

  return {
    gameState,
    moveSeesaw,
    startGame,
    launchClown,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
  };
};
