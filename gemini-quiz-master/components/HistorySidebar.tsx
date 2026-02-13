import React from 'react';
import { QuizHistoryItem, Difficulty } from '../types';
import { DIFFICULTY_LABELS } from '../constants';
import { Clock, BookOpen, Star } from 'lucide-react';

interface HistorySidebarProps {
  history: QuizHistoryItem[];
  onSelectTopic: (topic: string) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelectTopic }) => {
  if (history.length === 0) {
    return (
      <div className="text-gray-400 text-sm text-center py-4">
        履歴はまだありません
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
      {history.map((item, idx) => (
        <div 
          key={idx}
          onClick={() => onSelectTopic(item.topic)}
          className="bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-indigo-500 cursor-pointer transition-colors group"
        >
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors truncate w-full">
              {item.topic}
            </h4>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 bg-slate-700 px-2 py-0.5 rounded">
              <Star size={10} />
              Lv.{item.difficulty}
            </span>
            <span className="flex items-center gap-1 bg-slate-700 px-2 py-0.5 rounded">
              <BookOpen size={10} />
              {item.score}/{item.total}
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <Clock size={10} />
              {new Date(item.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistorySidebar;