import React, { useState, useEffect } from 'react';
import { DifficultyLevel, QuizConfig, QuizQuestion, ViewState, QuizHistoryItem } from './types';
import { DIFFICULTY_LABELS, DEFAULT_QUESTION_COUNT, MAX_QUESTION_COUNT, MIN_QUESTION_COUNT, HISTORY_STORAGE_KEY } from './constants';
import { generateQuiz } from './services/geminiService';
import { QuizGame } from './components/QuizGame';
import { HistorySidebar } from './components/HistorySidebar';
import { BrainCircuit, Loader2, Sparkles, AlertCircle, RotateCcw, Menu, X, Settings2, Play } from 'lucide-react';

export default function App() {
  // State
  const [view, setView] = useState<ViewState>('setup');
  const [config, setConfig] = useState<QuizConfig>({
    topic: '',
    difficulty: DifficultyLevel.NORMAL,
    questionCount: DEFAULT_QUESTION_COUNT
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (newConfig: QuizConfig, finalScore: number) => {
    const newItem: QuizHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      config: newConfig,
      score: finalScore
    };
    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  };

  const startQuiz = async (overrideConfig?: QuizConfig) => {
    const activeConfig = overrideConfig || config;
    
    if (!activeConfig.topic.trim()) {
      setError("お題を入力してください");
      return;
    }

    setIsLoading(true);
    setError(null);
    setConfig(activeConfig); // Update state if overridden

    try {
      const generatedQuestions = await generateQuiz(activeConfig);
      if (generatedQuestions.length === 0) throw new Error("問題の生成に失敗しました");
      
      setQuestions(generatedQuestions);
      setView('quiz');
    } catch (e) {
      setError("クイズの生成中にエラーが発生しました。ネットワーク接続を確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = (finalScore: number) => {
    setScore(finalScore);
    saveToHistory(config, finalScore);
    setView('result');
  };

  const handleReset = () => {
    setScore(0);
    setQuestions([]);
    setView('setup');
  };

  // Setup View Component
  const SetupView = () => (
    <div className="w-full max-w-xl mx-auto p-4 md:p-6 animate-fade-in relative z-10">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 border border-slate-700/50 shadow-2xl relative overflow-hidden group">
        
        {/* Decorative elements inside card */}
        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
          <Settings2 className="w-32 h-32 text-indigo-500 transform rotate-12" />
        </div>

        <div className="relative z-10">
          <div className="mb-10 text-left">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">AI Powered Quiz</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 font-heading tracking-tight">
              Quiz Master
            </h1>
            <p className="text-slate-400 text-lg">
              どんなお題でも、AIが即座にクイズを作成。
            </p>
          </div>

          <div className="space-y-8">
            {/* Topic Input */}
            <div className="space-y-3">
              <label className="block text-slate-300 text-sm font-semibold tracking-wide uppercase">
                クイズのお題
              </label>
              <div className="relative group/input">
                <input 
                  type="text" 
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  placeholder="例: 日本の城, 90年代J-POP, 量子力学..."
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-2xl p-4 pl-5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-lg shadow-inner"
                />
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 opacity-0 group-hover/input:opacity-100 pointer-events-none transition-opacity"></div>
              </div>
            </div>

            {/* Difficulty Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-slate-300 text-sm font-semibold tracking-wide uppercase">難易度</label>
                <div className="text-right">
                  <span className="block text-indigo-400 font-bold text-lg">
                    {DIFFICULTY_LABELS[config.difficulty].split(' ')[0]}
                  </span>
                  <span className="text-xs text-slate-500">
                    {DIFFICULTY_LABELS[config.difficulty].split(' ')[1]}
                  </span>
                </div>
              </div>
              <input 
                type="range" 
                min={1} 
                max={5} 
                step={1}
                value={config.difficulty}
                onChange={(e) => setConfig({ ...config, difficulty: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between px-1">
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-slate-300 text-sm font-semibold tracking-wide uppercase">問題数</label>
                <span className="text-indigo-400 font-bold text-2xl font-heading">{config.questionCount}<span className="text-base ml-1 text-slate-500">問</span></span>
              </div>
              <input 
                type="range" 
                min={MIN_QUESTION_COUNT} 
                max={MAX_QUESTION_COUNT} 
                step={1}
                value={config.questionCount}
                onChange={(e) => setConfig({ ...config, questionCount: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm flex items-center animate-pulse">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                {error}
              </div>
            )}

            <button 
              onClick={() => startQuiz()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center group/btn relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="text-lg mr-2 relative z-10">クイズを生成</span>
              <Play className="w-5 h-5 fill-current relative z-10" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative bg-[#0f172a] overflow-hidden font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-600/20 rounded-full blur-[128px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      {/* Mobile Header */}
      <header className="absolute top-0 left-0 right-0 p-4 z-40 flex justify-between items-center md:hidden bg-gradient-to-b from-slate-900/80 to-transparent">
        <div className="flex items-center text-white font-bold text-xl font-heading tracking-tight">
           <BrainCircuit className="w-7 h-7 mr-2 text-indigo-500" />
           Quiz Master
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white p-2 bg-slate-800/50 rounded-lg backdrop-blur-md">
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div className="flex flex-1 relative z-10 h-screen overflow-hidden">
        
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 w-80 bg-slate-900/90 border-r border-slate-800/50 backdrop-blur-xl transform transition-transform duration-300 ease-out z-30 shadow-2xl
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-6 md:p-8 flex items-center justify-between">
               <div className="flex items-center">
                 <div className="bg-indigo-600 p-2 rounded-xl mr-3 shadow-lg shadow-indigo-600/20">
                    <BrainCircuit className="w-6 h-6 text-white" />
                 </div>
                 <span className="font-bold text-white text-xl font-heading tracking-tight">Quiz Master</span>
               </div>
               <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white transition-colors">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="px-6 pb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">History</p>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
              <HistorySidebar 
                history={history} 
                onSelectHistory={(item) => {
                  setConfig(item.config);
                  setIsSidebarOpen(false);
                }} 
              />
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto relative scrollbar-hide">
          
          {view === 'setup' && (
            <div className="flex-1 flex items-center justify-center p-4">
              <SetupView />
            </div>
          )}

          {view === 'loading' && (
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
              </div>
              <div className="relative z-10 text-center">
                <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mx-auto mb-8" />
                <h2 className="text-3xl font-bold text-white mb-3 font-heading">Generating Quiz...</h2>
                <p className="text-slate-400 text-lg">
                  AIが「<span className="text-indigo-400 font-semibold">{config.topic}</span>」の<br/>
                  難易度<span className="text-indigo-400 font-semibold">{DIFFICULTY_LABELS[config.difficulty].split(' ')[0]}</span>の問題を作成中
                </p>
              </div>
            </div>
          )}

          {view === 'quiz' && (
            <QuizGame 
              questions={questions} 
              config={config} 
              onFinish={handleFinish} 
            />
          )}

          {view === 'result' && (
            <div className="flex-1 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 border border-slate-700/50 shadow-2xl text-center max-w-lg w-full relative overflow-hidden">
                {/* Result Confetti/Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 mb-6 relative">
                      <svg className="absolute inset-0 w-full h-full -rotate-90 text-indigo-600" viewBox="0 0 36 36">
                         <path
                            className="text-slate-700"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${(score / questions.length) * 100}, 100`}
                          />
                      </svg>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-white leading-none">{score}</span>
                        <span className="text-xs text-slate-400 font-medium">/{questions.length}</span>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white font-heading">Result</h2>
                    <p className="text-indigo-400 mt-2 font-medium text-lg border-b border-indigo-500/20 inline-block px-4 pb-1">
                      {config.topic}
                    </p>
                  </div>

                  <p className="text-slate-300 mb-10 text-lg leading-relaxed">
                    {score === questions.length ? '完璧です！AIも驚く知識量ですね！🏆' : 
                     score >= questions.length / 2 ? '素晴らしい！なかなかの博識ぶりです。✨' : 
                     'お疲れ様でした！新しい知識が身につきましたね。🌱'}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => startQuiz()} 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-900/30 flex items-center justify-center"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      再挑戦
                    </button>
                    <button 
                      onClick={handleReset} 
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] border border-slate-700"
                    >
                      設定へ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}