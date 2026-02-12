import React, { useState, useEffect } from 'react';
import { QuizConfig, Question, Difficulty, AppState, QuizHistoryItem, GameMode, Player } from './types';
import { generateQuiz } from './services/geminiService';
import { DEFAULT_CONFIG, DIFFICULTY_LABELS } from './constants';
import QuizCard from './components/QuizCard';
import ChatAssistant from './components/ChatAssistant';
import HistorySidebar from './components/HistorySidebar';
import Lobby from './components/Lobby';
import LiveLeaderboard from './components/LiveLeaderboard';
import { useMultiplayer } from './hooks/useMultiplayer';
import { BrainCircuit, Loader2, Trophy, RotateCcw, AlertCircle, Wifi, WifiOff, Users, User } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('single');
  const [config, setConfig] = useState<QuizConfig>({ topic: '', ...DEFAULT_CONFIG });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loadingError, setLoadingError] = useState('');
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Multiplayer State
  const [userName, setUserName] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const { connect, players, myId, startGame, updateProgress, gameStartData, roomId } = useMultiplayer();

  useEffect(() => {
    // Load history
    const saved = localStorage.getItem('quiz_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
    // Load Name
    const savedName = localStorage.getItem('player_name');
    if (savedName) setUserName(savedName);

    // Check URL Hash for Room ID (e.g., #room=ABCD)
    const hash = window.location.hash;
    if (hash.startsWith('#room=')) {
      const idFromUrl = hash.replace('#room=', '');
      if (idFromUrl) {
        setInputRoomId(idFromUrl);
      }
    }

    // Online status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save Name
  const handleNameChange = (name: string) => {
    setUserName(name);
    localStorage.setItem('player_name', name);
  };

  // Handle Game Start Data (Guest)
  useEffect(() => {
    if (gameStartData && appState === 'lobby') {
      setQuestions(gameStartData.questions);
      setConfig(gameStartData.config);
      setCurrentQIndex(0);
      setScore(0);
      setAppState('quiz');
    }
  }, [gameStartData, appState]);

  const saveHistory = (newScore: number) => {
    const newItem: QuizHistoryItem = {
      timestamp: Date.now(),
      topic: config.topic,
      difficulty: config.difficulty,
      score: newScore,
      total: questions.length,
    };
    const newHistory = [newItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('quiz_history', JSON.stringify(newHistory));
  };

  const startSingleQuiz = async () => {
    if (!config.topic.trim()) return;
    setAppState('loading');
    setLoadingError('');
    setIsChatOpen(false);

    try {
      const generatedQuestions = await generateQuiz(config);
      setQuestions(generatedQuestions);
      setCurrentQIndex(0);
      setScore(0);
      setAppState('quiz');
    } catch (error) {
      setLoadingError('クイズの生成に失敗しました。APIキーを確認してください。');
      setAppState('setup');
    }
  };

  const startMultiplayerQuiz = async () => {
    if (!config.topic.trim()) return;
    setAppState('loading'); // Show loading on Host
    setLoadingError('');
    
    try {
      const generatedQuestions = await generateQuiz(config);
      setQuestions(generatedQuestions);
      setCurrentQIndex(0);
      setScore(0);
      startGame(generatedQuestions, config);
      setAppState('quiz');
    } catch (error) {
      setLoadingError('クイズの生成に失敗しました。APIキーを確認してください。');
      setAppState('lobby');
    }
  };

  const handleCreateRoom = () => {
    if (!userName.trim()) return;
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    connect(newRoomId, userName, true);
    setGameMode('multi');
    setAppState('lobby');
    // Clear hash to clean up URL
    window.location.hash = '';
  };

  const handleJoinRoom = () => {
    if (!userName.trim() || !inputRoomId.trim()) return;
    connect(inputRoomId.toUpperCase(), userName, false);
    setGameMode('multi');
    setAppState('lobby');
  };

  const handleAnswer = (isCorrect: boolean) => {
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    const isFinished = currentQIndex >= questions.length - 1;
    
    // Send progress in Multiplayer
    if (gameMode === 'multi') {
      // +1 to index to indicate completed count or next index
      updateProgress(newScore, currentQIndex + 1, isFinished);
    }
    
    if (!isFinished) {
      setTimeout(() => setCurrentQIndex(i => i + 1), 1000);
    } else {
      setTimeout(() => {
        saveHistory(newScore);
        setAppState('result');
      }, 1000);
    }
  };

  const resetApp = () => {
    // Determine where to go back
    if (gameMode === 'multi') {
      // In multi, going back usually means leaving room or back to lobby (if supported)
      // For simplicity, reload or back to menu
      window.location.reload(); 
    } else {
      setAppState('menu');
      setConfig(prev => ({ ...prev, topic: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Network Status */}
      <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold z-50 ${isOnline ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        {isOnline ? 'ONLINE' : 'OFFLINE'}
      </div>

      <main className={`flex-1 flex flex-col items-center justify-center p-4 transition-all duration-300 ${isChatOpen ? 'mr-0 sm:mr-96' : ''}`}>
        
        {/* MENU SCREEN */}
        {appState === 'menu' && (
          <div className="w-full max-w-md animate-fade-in text-center space-y-8">
            <div className="mb-8">
               <div className="flex justify-center mb-4 text-indigo-400">
                 <BrainCircuit size={64} />
               </div>
               <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Gemini Quiz Master</h1>
               <p className="text-slate-400">AIが生成する無限のクイズに挑戦しよう</p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-left text-sm font-medium text-slate-400 mb-1 ml-1">プレイヤー名</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="名前を入力..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-center text-lg mb-4"
                  />
               </div>

               <button 
                 onClick={() => {
                    if(!userName.trim()) return alert("名前を入力してください");
                    setGameMode('single');
                    setAppState('setup');
                 }}
                 className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
               >
                 <User size={24} className="text-indigo-400" />
                 <div>
                   <div className="text-lg">シングルプレイ</div>
                   <div className="text-xs text-slate-400 font-normal">一人でじっくり挑戦</div>
                 </div>
               </button>

               <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => {
                     if(!userName.trim()) return alert("名前を入力してください");
                     handleCreateRoom();
                   }}
                   className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
                 >
                   <Users size={24} />
                   <span className="text-sm">ルーム作成</span>
                 </button>
                 
                 <div className="relative">
                   <input 
                      type="text" 
                      placeholder="ID入力"
                      value={inputRoomId}
                      onChange={(e) => setInputRoomId(e.target.value)}
                      className="absolute inset-x-0 bottom-full mb-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-center text-sm focus:outline-none focus:border-indigo-500 font-mono tracking-wider"
                   />
                   <button 
                     onClick={() => {
                       if(!userName.trim()) return alert("名前を入力してください");
                       handleJoinRoom();
                     }}
                     className="w-full h-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                   >
                     <Users size={24} className="text-green-400" />
                     <span className="text-sm">参加する</span>
                   </button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* SINGLE PLAYER SETUP */}
        {appState === 'setup' && (
          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-xl">
              <button onClick={() => setAppState('menu')} className="text-sm text-slate-400 mb-4 hover:text-white">← 戻る</button>
              <div className="flex items-center gap-3 mb-6 text-indigo-400">
                <BrainCircuit size={32} />
                <h1 className="text-3xl font-bold text-white">クイズ設定</h1>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">クイズのお題</label>
                  <input
                    type="text"
                    value={config.topic}
                    onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                    placeholder="例: 日本の歴史, ポケットモンスター..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-lg text-white focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      難易度: <span className="text-indigo-400">{DIFFICULTY_LABELS[config.difficulty]}</span>
                    </label>
                    <input 
                      type="range" min="1" max="5" step="1"
                      value={config.difficulty}
                      onChange={(e) => setConfig({ ...config, difficulty: parseInt(e.target.value) as Difficulty })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      問題数: <span className="text-indigo-400">{config.count}問</span>
                    </label>
                    <input 
                      type="range" min="1" max="10" step="1"
                      value={config.count}
                      onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                {loadingError && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-start gap-3 text-sm">
                    <AlertCircle size={16} />
                    <p>{loadingError}</p>
                  </div>
                )}

                <button
                  onClick={startSingleQuiz}
                  disabled={!config.topic}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                >
                  クイズを開始
                </button>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-md p-6 rounded-2xl border border-slate-700 h-fit">
              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <RotateCcw size={20} className="text-slate-400" />
                履歴
              </h3>
              <HistorySidebar 
                history={history} 
                onSelectTopic={(topic) => setConfig({ ...config, topic })} 
              />
            </div>
          </div>
        )}

        {/* MULTIPLAYER LOBBY */}
        {appState === 'lobby' && (
           <Lobby 
             roomId={roomId || 'Loading...'}
             players={players}
             myId={myId}
             isHost={players.find(p => p.id === myId)?.isHost || false}
             config={config}
             onConfigChange={setConfig}
             onStart={startMultiplayerQuiz}
             onLeave={() => window.location.reload()}
           />
        )}

        {/* LOADING */}
        {appState === 'loading' && (
          <div className="text-center animate-fade-in space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
              <Loader2 className="animate-spin text-indigo-400 relative z-10 mx-auto" size={64} />
            </div>
            <h2 className="text-2xl font-bold text-white">Geminiが問題を生成中...</h2>
            <p className="text-slate-400">お題: {config.topic}</p>
          </div>
        )}

        {/* QUIZ GAME */}
        {appState === 'quiz' && questions.length > 0 && (
          <div className="w-full max-w-4xl animate-fade-in flex flex-col items-center">
            {gameMode === 'multi' && (
              <LiveLeaderboard 
                players={players} 
                myId={myId} 
                totalQuestions={questions.length} 
              />
            )}
            <QuizCard
              question={questions[currentQIndex]}
              questionNumber={currentQIndex + 1}
              totalQuestions={questions.length}
              onAnswer={handleAnswer}
              onOpenChat={() => setIsChatOpen(true)}
            />
          </div>
        )}

        {/* RESULT */}
        {appState === 'result' && (
          <div className="text-center animate-fade-in bg-slate-800/50 backdrop-blur-md p-10 rounded-3xl border border-slate-700 shadow-2xl max-w-lg w-full">
            <div className="mb-6 inline-flex p-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
              <Trophy size={48} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">結果発表</h2>
            <p className="text-slate-400 mb-8">{config.topic}</p>
            
            <div className="text-6xl font-black text-white mb-2">
              <span className="text-indigo-400">{score}</span>
              <span className="text-2xl text-slate-500 ml-2">/ {questions.length}</span>
            </div>
            
            {gameMode === 'multi' && (
               <div className="my-6 text-left bg-slate-900/50 p-4 rounded-xl max-h-40 overflow-y-auto">
                 <h4 className="text-sm font-bold text-slate-400 mb-2">最終順位</h4>
                 {players.sort((a,b) => b.score - a.score).map((p, idx) => (
                    <div key={p.id} className="flex justify-between text-sm py-1">
                       <span className={p.id === myId ? "text-indigo-400 font-bold" : "text-slate-300"}>
                         {idx+1}. {p.name}
                       </span>
                       <span className="font-mono">{p.score}pts</span>
                    </div>
                 ))}
               </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={resetApp}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-colors font-bold"
              >
                {gameMode === 'multi' ? '退出する' : 'トップに戻る'}
              </button>
            </div>
          </div>
        )}

      </main>

      <ChatAssistant 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        topic={config.topic}
        currentQuestion={appState === 'quiz' ? questions[currentQIndex] : null}
      />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;