import { useState, useEffect, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { GameCanvas } from './GameCanvas';
import { GameHUD } from './GameHUD';
import { GameOver } from './GameOver';
import { StartScreen } from './StartScreen';
import { LeaderboardEntry } from '@/types/game';
import { getApiBaseUrl } from '@/lib/api';

const API_BASE_URL = getApiBaseUrl();

export const CircusGame = () => {
  const { gameState, moveSeesaw, startGame, launchClown, canvasWidth, canvasHeight } = useGameEngine();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Fetch leaderboard from API on mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/leaderboard`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.entries);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        // Fallback to empty leaderboard if API unavailable
      }
    };

    fetchLeaderboard();
  }, []);

  const saveScore = useCallback(async (name: string, score: number) => {
    try {
      // Submit score to API
      const response = await fetch(`${API_BASE_URL}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score }),
      });

      if (response.ok) {
        // Refresh leaderboard after successful submission
        const leaderboardResponse = await fetch(`${API_BASE_URL}/leaderboard`);
        if (leaderboardResponse.ok) {
          const data = await leaderboardResponse.json();
          setLeaderboard(data.entries);
        }
      } else {
        console.error('Failed to submit score:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameState.isPlaying) {
          startGame();
        } else if (!gameState.isGameOver) {
          launchClown();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isPlaying, gameState.isGameOver, startGame, launchClown]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 min-h-screen">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-primary arcade-text pixel-font">
          CIRCUS CLOWNS
        </h1>
      </header>

      <GameHUD 
        score={gameState.score} 
        lives={gameState.lives}
        bonusJumps={gameState.bonusJumps}
      />

      <div className="relative">
        <GameCanvas
          gameState={gameState}
          width={canvasWidth}
          height={canvasHeight}
          onMouseMove={moveSeesaw}
          onClick={launchClown}
        />
        
        {!gameState.isPlaying && !gameState.isGameOver && (
          <StartScreen onStart={startGame} leaderboard={leaderboard} />
        )}
        
        {gameState.isGameOver && (
          <GameOver
            score={gameState.score}
            onRestart={startGame}
            onSaveScore={saveScore}
            leaderboard={leaderboard}
          />
        )}
      </div>

      <footer className="text-center text-xs text-muted-foreground mt-4">
        <p>Move mouse to control seesaw • Click or SPACE to launch clown</p>
        <p className="mt-1">Inspired by Circus (Exidy, 1977) & Clowns (Midway, 1978)</p>
      </footer>
    </div>
  );
};
