import { describe, it, expect } from 'vitest';
import {
  getBalloonScore,
  getRowBonus,
  checkRowCleared,
  getExtraJumpsForRowClear,
  calculateBalloonHitScore,
  BALLOON_POINTS,
  ROW_BONUS,
  BOUNCE_POINTS,
} from '@/utils/scoring';
import { Balloon } from '@/types/game';

describe('Scoring Logic', () => {
  describe('Balloon point values', () => {
    it('should return correct score for yellow balloon', () => {
      expect(getBalloonScore('yellow')).toBe(20);
      expect(BALLOON_POINTS['yellow']).toBe(20);
    });

    it('should return correct score for green balloon', () => {
      expect(getBalloonScore('green')).toBe(50);
      expect(BALLOON_POINTS['green']).toBe(50);
    });

    it('should return correct score for blue balloon', () => {
      expect(getBalloonScore('blue')).toBe(100);
      expect(BALLOON_POINTS['blue']).toBe(100);
    });
  });

  describe('Row bonus values', () => {
    it('should return correct row bonus for yellow row', () => {
      expect(getRowBonus('yellow')).toBe(200);
      expect(ROW_BONUS['yellow']).toBe(200);
    });

    it('should return correct row bonus for green row', () => {
      expect(getRowBonus('green')).toBe(500);
      expect(ROW_BONUS['green']).toBe(500);
    });

    it('should return correct row bonus for blue row', () => {
      expect(getRowBonus('blue')).toBe(1000);
      expect(ROW_BONUS['blue']).toBe(1000);
    });
  });

  describe('Row clear detection', () => {
    it('should detect when a row is cleared', () => {
      const balloons: Balloon[] = [
        {
          id: '0-0',
          x: 100,
          y: 100,
          color: 'yellow',
          row: 0,
          popped: true,
        },
        {
          id: '0-1',
          x: 150,
          y: 100,
          color: 'yellow',
          row: 0,
          popped: true,
        },
        {
          id: '0-2',
          x: 200,
          y: 100,
          color: 'yellow',
          row: 0,
          popped: true,
        },
      ];

      const bonus = checkRowCleared(balloons, 0, 'yellow');
      expect(bonus).toBe(200); // Yellow row bonus
    });

    it('should return 0 when row is not cleared', () => {
      const balloons: Balloon[] = [
        {
          id: '1-0',
          x: 100,
          y: 140,
          color: 'green',
          row: 1,
          popped: true,
        },
        {
          id: '1-1',
          x: 150,
          y: 140,
          color: 'green',
          row: 1,
          popped: false, // Not popped!
        },
      ];

      const bonus = checkRowCleared(balloons, 1, 'green');
      expect(bonus).toBe(0);
    });

    it('should correctly identify cleared blue row and grant extra jump', () => {
      const balloons: Balloon[] = [
        {
          id: '2-0',
          x: 100,
          y: 60,
          color: 'blue',
          row: 2,
          popped: true,
        },
        {
          id: '2-1',
          x: 150,
          y: 60,
          color: 'blue',
          row: 2,
          popped: true,
        },
      ];

      const bonus = checkRowCleared(balloons, 2, 'blue');
      expect(bonus).toBe(1000); // Blue row bonus

      const extraJumps = getExtraJumpsForRowClear('blue');
      expect(extraJumps).toBe(1);
    });
  });

  describe('Extra jumps from row clears', () => {
    it('should grant extra jump for clearing blue row', () => {
      expect(getExtraJumpsForRowClear('blue')).toBe(1);
    });

    it('should not grant extra jump for yellow row', () => {
      expect(getExtraJumpsForRowClear('yellow')).toBe(0);
    });

    it('should not grant extra jump for green row', () => {
      expect(getExtraJumpsForRowClear('green')).toBe(0);
    });
  });

  describe('Complete balloon hit calculation', () => {
    it('should calculate score correctly for a single balloon pop without row clear', () => {
      const balloons: Balloon[] = [
        {
          id: '0-0',
          x: 100,
          y: 100,
          color: 'yellow',
          row: 0,
          popped: true,
        },
        {
          id: '0-1',
          x: 150,
          y: 100,
          color: 'yellow',
          row: 0,
          popped: false,
        },
      ];

      const result = calculateBalloonHitScore(balloons, 0);
      expect(result.balloonScore).toBe(20); // Yellow balloon
      expect(result.rowBonus).toBe(0); // Row not cleared
      expect(result.extraJumps).toBe(0);
    });

    it('should calculate score correctly when row is cleared', () => {
      const balloons: Balloon[] = [
        {
          id: '2-0',
          x: 100,
          y: 60,
          color: 'blue',
          row: 2,
          popped: true,
        },
      ];

      const result = calculateBalloonHitScore(balloons, 0);
      expect(result.balloonScore).toBe(100); // Blue balloon
      expect(result.rowBonus).toBe(1000); // Blue row bonus
      expect(result.extraJumps).toBe(1); // Blue row grants extra jump
    });
  });

  describe('Game constants', () => {
    it('should define bounce points constant', () => {
      expect(BOUNCE_POINTS).toBe(10);
    });
  });
});
