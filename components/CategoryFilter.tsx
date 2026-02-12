import React from 'react';
import { AppCategory, Language } from '../types';
import { CATEGORIES, UI_TEXT } from '../constants';

interface CategoryFilterProps {
  selectedCategory: AppCategory;
  setSelectedCategory: (category: AppCategory) => void;
  language: Language;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, setSelectedCategory, language }) => {
  const t = UI_TEXT[language];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-8">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
            ${
              selectedCategory === category
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 ring-1 ring-slate-700'
            }
          `}
        >
          {t.categories[category]}
        </button>
      ))}
    </div>
  );
};
