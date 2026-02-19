export enum DifficultyLevel {
  VERY_EASY = 1,
  EASY = 2,
  NORMAL = 3,
  HARD = 4,
  VERY_HARD = 5,
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizConfig {
  topic: string;
  difficulty: DifficultyLevel;
  questionCount: number;
}

export interface QuizHistoryItem {
  id: string;
  timestamp: number;
  config: QuizConfig;
  score: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ViewState = 'setup' | 'loading' | 'quiz' | 'result';

export type GameMode = 'single' | 'host' | 'guest';

export interface PeerData {
  type: 'START_GAME' | 'UPDATE_SCORE';
  questions?: QuizQuestion[];
  config?: QuizConfig;
  score?: number;
  progress?: number;
}