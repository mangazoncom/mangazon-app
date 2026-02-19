import React from 'react';
import { QuizHistoryItem } from '../types';
import { Clock, Trophy, ChevronRight, History } from 'lucide-react';

interface HistorySidebarProps {
  history: QuizHistoryItem[];
  onSelectHistory: (item: QuizHistoryItem) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelectHistory }) => {
  if (history.length === 0) {
    return (
      <div className="text-slate-500 text-center p-8 flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-800 rounded-2xl mx-2">
        <History className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">履歴はありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item, index) => (
        <button
          key={item.id}
          onClick={() => onSelectHistory(item)}
          className="w-full text-left bg-slate-800/40 hover:bg-slate-800 transition-all p-4 rounded-xl border border-slate-800 hover:border-indigo-500/30 group relative overflow-hidden"
        >
          {/* Hover effect gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="font-semibold text-slate-200 truncate pr-2 group-hover:text-indigo-300 transition-colors">
              {item.config.topic}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors transform group-hover:translate-x-1" />
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-400 relative z-10">
            <span className="flex items-center">
              <Trophy className={`w-3 h-3 mr-1.5 ${item.score === item.config.questionCount ? 'text-yellow-500' : 'text-slate-500'}`} />
              <span className={item.score === item.config.questionCount ? 'text-yellow-500 font-bold' : ''}>
                {item.score}/{item.config.questionCount}
              </span>
            </span>
            <span className="flex items-center text-slate-500">
              <Clock className="w-3 h-3 mr-1.5" />
              {new Date(item.timestamp).toLocaleDateString()}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};