export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Clown extends Position, Velocity {
  isFlying: boolean;
  isOnSeesaw: boolean;
  seesawSide: 'left' | 'right';
}

export interface Balloon extends Position {
  id: string;
  color: 'yellow' | 'green' | 'blue';
  row: number;
  popped: boolean;
}

export interface Seesaw {
  x: number;
  y: number;
  width: number;
  tilt: 'left' | 'right' | 'center';
}

export interface GameState {
  score: number;
  lives: number;
  bonusJumps: number;
  isPlaying: boolean;
  isGameOver: boolean;
  clowns: Clown[];
  balloons: Balloon[];
  seesaw: Seesaw;
  floatingTexts: FloatingText[];
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  createdAt: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

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
