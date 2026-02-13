export enum Difficulty {
  VERY_EASY = 1,
  EASY = 2,
  NORMAL = 3,
  HARD = 4,
  VERY_HARD = 5,
}

export interface QuizConfig {
  topic: string;
  count: number;
  difficulty: Difficulty;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizHistoryItem {
  timestamp: number;
  topic: string;
  difficulty: Difficulty;
  score: number;
  total: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  currentQuestionIndex: number;
  finished: boolean;
}

export type AppState = 'menu' | 'setup' | 'loading' | 'lobby' | 'quiz' | 'result';
export type GameMode = 'single' | 'multi';
