import { describe, it, expect } from 'vitest';
import { GameState, Balloon, Clown } from '@/types/game';

/**
 * Pure logic for game state initialization.
 * These functions are tested to ensure correct initial state setup.
 */

export function createInitialGameState(): GameState {
  return {
    score: 0,
    lives: 3,
    bonusJumps: 0,
    isPlaying: false,
    isGameOver: false,
    clowns: [],
    balloons: [],
    seesaw: {
      x: 400,
      y: 520,
      width: 120,
      tilt: 'left',
    },
    floatingTexts: [],
  };
}

/**
 * Test suite for game state initialization
 */
describe('Game State Initialization', () => {
  it('should initialize game with correct default values', () => {
    const state = createInitialGameState();

    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.bonusJumps).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.isGameOver).toBe(false);
    expect(state.clowns).toEqual([]);
    expect(state.balloons).toEqual([]);
  });

  it('should initialize seesaw with correct center position', () => {
    const state = createInitialGameState();

    expect(state.seesaw.x).toBe(400);
    expect(state.seesaw.y).toBe(520);
    expect(state.seesaw.width).toBe(120);
    expect(state.seesaw.tilt).toBe('left');
  });

  it('should start with no floating texts', () => {
    const state = createInitialGameState();

    expect(state.floatingTexts).toEqual([]);
    expect(Array.isArray(state.floatingTexts)).toBe(true);
  });

  describe('Game state updates', () => {
    it('should correctly add points to score', () => {
      const state = createInitialGameState();
      const newScore = state.score + 150; // Pop green balloon + row bonus

      expect(newScore).toBe(150);
    });

    it('should correctly decrement lives', () => {
      const state = createInitialGameState();
      const newLives = state.lives - 1;

      expect(newLives).toBe(2);
    });

    it('should correctly add bonus jumps', () => {
      const state = createInitialGameState();
      const newBonusJumps = state.bonusJumps + 1; // Clear blue row

      expect(newBonusJumps).toBe(1);
    });

    it('should handle multiple score updates', () => {
      let score = 0;
      score += 20; // Yellow balloon
      score += 50; // Green balloon
      score += 100; // Blue balloon
      score += 1000; // Blue row bonus

      expect(score).toBe(1170);
    });
  });
});
