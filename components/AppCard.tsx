import React from 'react';
import { ExternalLink, Star, Zap } from 'lucide-react';
import { AppItem, AppCategory, Language } from '../types';
import { UI_TEXT } from '../constants';

interface AppCardProps {
  app: AppItem;
  language: Language;
}

export const AppCard: React.FC<AppCardProps> = ({ app, language }) => {
  const t = UI_TEXT[language];
  const Icon = app.icon;

  const getCategoryColor = (cat: AppCategory) => {
    switch (cat) {
      case AppCategory.GAME: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case AppCategory.TOOL: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case AppCategory.AI: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <a 
      href={app.url}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
    >
      {/* Icon Header Section */}
      <div className="relative h-40 overflow-hidden bg-slate-900/50 flex items-center justify-center">
        {/* Background Glow Effect */}
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${app.color} transition-opacity duration-500 group-hover:opacity-30`} />
        
        {/* Main Icon */}
        <div className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${app.color} text-white shadow-xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon size={40} />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(app.category)}`}>
            {t.categories[app.category]}
          </span>
        </div>

        <div className="absolute top-3 right-3 z-20 flex gap-2">
          {app.isNew && (
            <span className="flex items-center gap-1 bg-amber-500 text-slate-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              <Zap size={12} fill="currentColor" /> {t.new}
            </span>
          )}
          {app.isPopular && (
            <span className="flex items-center gap-1 bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              <Star size={12} fill="currentColor" /> {t.hot}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
          {app.title[language]}
        </h3>
        <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
          {app.description[language]}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
          <span className="text-xs text-slate-500 font-medium group-hover:text-slate-400 transition-colors">
            {t.launchApp}
          </span>
          <div className="bg-slate-700/50 p-2 rounded-full text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
            <ExternalLink size={16} />
          </div>
        </div>
      </div>
    </a>
  );
};
