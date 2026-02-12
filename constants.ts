import { AppCategory, AppItem } from './types';
import { 
  Gamepad2, 
  FileJson, 
  Palette, 
  Rocket, 
  CheckSquare, 
  MessageSquare, 
  Grid3x3, 
  Cpu
} from 'lucide-react';

export const APP_NAME = "Nexus Portal";

export const CATEGORIES = [
  AppCategory.ALL,
  AppCategory.GAME,
  AppCategory.TOOL,
  AppCategory.UTILITY,
  AppCategory.AI,
];

export const UI_TEXT = {
  en: {
    searchPlaceholder: "Search apps, games, tools...",
    noAppsFound: "No apps found",
    noAppsDesc: "Try adjusting your search or category filter.",
    launchApp: "Launch",
    footerRights: "Nexus Portal. All rights reserved.",
    privacy: "Privacy",
    terms: "Terms",
    heroTitle: "Your Gateway to the Web",
    heroDesc: "Discover a curated collection of powerful tools, fun games, and essential utilities. All in one place.",
    new: "NEW",
    hot: "HOT",
    categories: {
      [AppCategory.ALL]: "All",
      [AppCategory.GAME]: "Game",
      [AppCategory.TOOL]: "Tool",
      [AppCategory.UTILITY]: "Utility",
      [AppCategory.AI]: "AI"
    }
  },
  ja: {
    searchPlaceholder: "アプリ、ゲーム、ツールを検索...",
    noAppsFound: "アプリが見つかりません",
    noAppsDesc: "検索キーワードやカテゴリを変更してみてください。",
    launchApp: "開く",
    footerRights: "Nexus Portal. All rights reserved.",
    privacy: "プライバシー",
    terms: "利用規約",
    heroTitle: "ウェブへの入り口",
    heroDesc: "便利なツール、楽しいゲーム、必須ユーティリティの厳選コレクション。すべてをここに。",
    new: "新着",
    hot: "人気",
    categories: {
      [AppCategory.ALL]: "すべて",
      [AppCategory.GAME]: "ゲーム",
      [AppCategory.TOOL]: "ツール",
      [AppCategory.UTILITY]: "ユーティリティ",
      [AppCategory.AI]: "AI"
    }
  }
};

export const MOCK_APPS: AppItem[] = [
  {
    id: '1',
    title: { en: 'gemini-quiz-master', ja: 'ジェミニクイズマスター' },
    description: { 
      en: 'quiz game.', 
      ja: 'クイズゲーム。' 
    },
    category: AppCategory.GAME,
    url: 'https://mangazon.jp/gemini-quiz-master/',
    icon: Gamepad2,
    color: 'from-fuchsia-500 to-purple-600',
    isPopular: true
  },
  {
    id: '2',
    title: { en: 'JSON Formatter', ja: 'JSONフォーマッター' },
    description: { 
      en: 'Beautify and validate JSON data instantly.', 
      ja: 'JSONデータを瞬時に整形・検証する開発者向けツール。' 
    },
    category: AppCategory.TOOL,
    url: '#',
    icon: FileJson,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: '3',
    title: { en: 'Pixel Painter', ja: 'ピクセルペインター' },
    description: { 
      en: 'Create pixel art directly in your browser.', 
      ja: 'ブラウザで手軽にドット絵を作成できるお絵かきツール。' 
    },
    category: AppCategory.TOOL,
    url: '#',
    icon: Palette,
    color: 'from-orange-400 to-pink-500'
  },
  {
    id: '4',
    title: { en: 'Space Invaders', ja: 'スペースインベーダー' },
    description: { 
      en: 'Classic arcade action with modern physics.', 
      ja: '現代的な物理演算を取り入れたクラシックアーケードゲーム。' 
    },
    category: AppCategory.GAME,
    url: '#',
    icon: Rocket,
    color: 'from-indigo-500 to-violet-600',
    isNew: true
  },
  {
    id: '5',
    title: { en: 'Task Master', ja: 'タスクマスター' },
    description: { 
      en: 'A simple, local-storage based Kanban board.', 
      ja: 'ローカル保存に対応したシンプルで使いやすいカンバンボード。' 
    },
    category: AppCategory.UTILITY,
    url: '#',
    icon: CheckSquare,
    color: 'from-emerald-400 to-teal-500'
  },
  {
    id: '6',
    title: { en: 'AI Chat Client', ja: 'AIチャット' },
    description: { 
      en: 'Interface for chatting with LLMs.', 
      ja: '最新の大規模言語モデルと対話できるチャットインターフェース。' 
    },
    category: AppCategory.AI,
    url: '#',
    icon: MessageSquare,
    color: 'from-rose-500 to-red-600',
    isNew: true
  },
  {
    id: '7',
    title: { en: 'Color Palette Gen', ja: 'カラーパレット生成' },
    description: { 
      en: 'Generate beautiful color schemes for your projects.', 
      ja: 'プロジェクトに最適な美しい配色パターンを自動生成します。' 
    },
    category: AppCategory.TOOL,
    url: '#',
    icon: Palette,
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: '8',
    title: { en: 'Sudoku Solver', ja: '数独ソルバー' },
    description: { 
      en: 'Solve any Sudoku puzzle instantly.', 
      ja: 'あらゆるナンプレ問題を一瞬で解くことができる便利ツール。' 
    },
    category: AppCategory.GAME,
    url: '#',
    icon: Grid3x3,
    color: 'from-sky-400 to-blue-500'
  },
  {
    id: '9',
    title: { en: 'System Monitor', ja: 'システムモニター' },
    description: { 
      en: 'Check your browser capabilities and performance.', 
      ja: 'ブラウザの機能やパフォーマンスをチェックするユーティリティ。' 
    },
    category: AppCategory.UTILITY,
    url: '#',
    icon: Cpu,
    color: 'from-slate-500 to-slate-700'
  },
];
