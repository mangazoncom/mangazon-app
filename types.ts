import { LucideIcon } from 'lucide-react';

export type Language = 'en' | 'ja';

export enum AppCategory {
  ALL = 'All',
  GAME = 'Game',
  TOOL = 'Tool',
  UTILITY = 'Utility',
  AI = 'AI'
}

export interface LocalizedText {
  en: string;
  ja: string;
}

export interface AppItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  url: string;
  category: AppCategory;
  icon: LucideIcon;
  color: string; // CSS class for gradient or color
  isNew?: boolean;
  isPopular?: boolean;
}
