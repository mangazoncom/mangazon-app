import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { AppCard } from './components/AppCard';
import { MOCK_APPS, UI_TEXT } from './constants';
import { AppCategory, Language } from './types';
import { Github, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>(AppCategory.ALL);
  const [language, setLanguage] = useState<Language>('ja'); // Default to Japanese as per request

  const t = UI_TEXT[language];

  // Filter apps based on search query and selected category
  const filteredApps = useMemo(() => {
    return MOCK_APPS.filter((app) => {
      const matchesCategory = selectedCategory === AppCategory.ALL || app.category === selectedCategory;
      
      const title = app.title[language].toLowerCase();
      const desc = app.description[language].toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = title.includes(query) || desc.includes(query);
      
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, language]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          language={language}
          setLanguage={setLanguage}
        />

        <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
          
          {/* Hero Section */}
          <div className="text-center py-12 md:py-20 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
              {t.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-slate-400">
              {t.heroDesc}
            </p>
          </div>

          <CategoryFilter 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
            language={language}
          />

          {/* Grid Layout */}
          <div className="mt-8">
            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredApps.map((app) => (
                  <AppCard key={app.id} app={app} language={language} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-block p-4 rounded-full bg-slate-800/50 mb-4">
                  <Globe className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-medium text-slate-300">{t.noAppsFound}</h3>
                <p className="text-slate-500 mt-2">{t.noAppsDesc}</p>
              </div>
            )}
          </div>
        </main>

        <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm mb-4">
              &copy; {new Date().getFullYear()} {t.footerRights}
            </p>
            <div className="flex justify-center gap-6">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                {t.privacy}
              </a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">
                {t.terms}
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
