import React from 'react';
import { Search, LayoutGrid, Languages } from 'lucide-react';
import { APP_NAME, UI_TEXT } from '../constants';
import { Language } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, language, setLanguage }) => {
  const t = UI_TEXT[language];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ja' : 'en');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <LayoutGrid size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            {APP_NAME}
          </span>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-center px-8">
          <div className="relative w-full max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right Section: Language Toggle & Profile */}
        <div className="flex items-center gap-3">
           <button 
             onClick={toggleLanguage}
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium"
           >
             <Languages size={16} />
             <span>{language === 'en' ? 'EN' : 'JP'}</span>
           </button>
           
           {/* Placeholder for user profile */}
           <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600"></div>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden border-t border-slate-700/50 p-4">
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-4 text-sm text-slate-200 focus:border-indigo-500 focus:bg-slate-800 focus:outline-none"
            />
        </div>
      </div>
    </header>
  );
};
