/**
 * Pure scoring logic for the Circus game.
 * No side effects, no dependencies on React or UI.
 */

import { Balloon } from '@/types/game';

// Scoring constants
export const BALLOON_POINTS: Record<Balloon['color'], number> = {
  yellow: 20,
  green: 50,
  blue: 100,
};

export const ROW_BONUS: Record<Balloon['color'], number> = {
  yellow: 200,
  green: 500,
  blue: 1000,
};

export const BOUNCE_POINTS = 10;

/**
 * Calculate points for popping a balloon of a given color.
 */
export function getBalloonScore(color: Balloon['color']): number {
  return BALLOON_POINTS[color];
}

/**
 * Calculate row bonus for clearing a row.
 */
export function getRowBonus(color: Balloon['color']): number {
  return ROW_BONUS[color];
}

/**
 * Check if a row is completely cleared (all balloons popped).
 * Returns the bonus points if cleared, 0 otherwise.
 */
export function checkRowCleared(
  balloons: Balloon[],
  row: number,
  color: Balloon['color']
): number {
  const rowBalloons = balloons.filter(b => b.row === row);
  const allPopped = rowBalloons.every(b => b.popped);
  return allPopped ? ROW_BONUS[color] : 0;
}

/**
 * Calculate extra jumps granted for clearing a row.
 * Only blue row clears grant extra jumps.
 */
export function getExtraJumpsForRowClear(color: Balloon['color']): number {
  return color === 'blue' ? 1 : 0;
}

/**
 * Calculate total score for popping a single balloon and checking for row clear.
 * Returns { balloonScore, rowBonus, extraJumps }
 */
export function calculateBalloonHitScore(
  balloons: Balloon[],
  balloonIndex: number
): { balloonScore: number; rowBonus: number; extraJumps: number } {
  const balloon = balloons[balloonIndex];
  
  const balloonScore = getBalloonScore(balloon.color);
  const rowBonus = checkRowCleared(balloons, balloon.row, balloon.color);
  const extraJumps = getExtraJumpsForRowClear(balloon.color);

  return {
    balloonScore,
    rowBonus,
    extraJumps,
  };
}
