import { Difficulty } from './types';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [Difficulty.VERY_EASY]: '激アマ（誰でも解ける）',
  [Difficulty.EASY]: '初級（基礎知識）',
  [Difficulty.NORMAL]: '中級（一般的）',
  [Difficulty.HARD]: '上級（専門的）',
  [Difficulty.VERY_HARD]: '激ヤバ（識者も悩む）',
};

export const DEFAULT_CONFIG = {
  count: 5,
  difficulty: Difficulty.NORMAL,
};

export const MAX_QUESTIONS = 30;
export const MIN_QUESTIONS = 1;