import { DifficultyLevel } from './types';

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.VERY_EASY]: "激アマ簡単 (誰でも解ける)",
  [DifficultyLevel.EASY]: "簡単 (一般常識)",
  [DifficultyLevel.NORMAL]: "普通 (平均レベル)",
  [DifficultyLevel.HARD]: "難しい (専門家レベル)",
  [DifficultyLevel.VERY_HARD]: "激ヤバ高難度 (識者も唸る)",
};

export const DEFAULT_QUESTION_COUNT = 5;
export const MAX_QUESTION_COUNT = 30;
export const MIN_QUESTION_COUNT = 3;

export const HISTORY_STORAGE_KEY = 'gemini-quiz-history';