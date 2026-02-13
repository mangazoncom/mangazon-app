import React from 'react';
import { Player, QuizConfig, Difficulty } from '../types';
import { DIFFICULTY_LABELS } from '../constants';
import { Users, Crown, Play, Copy, Check, Link as LinkIcon } from 'lucide-react';

interface LobbyProps {
  roomId: string;
  players: Player[];
  myId: string;
  isHost: boolean;
  config: QuizConfig;
  onConfigChange: (config: QuizConfig) => void;
  onStart: () => void;
  onLeave: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ 
  roomId, players, myId, isHost, config, onConfigChange, onStart, onLeave 
}) => {
  const [copiedId, setCopiedId] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyShareLink = () => {
    // Construct URL with hash
    const url = `${window.location.origin}${window.location.pathname}#room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
      {/* Left: Room Info & Config */}
      <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-400 mb-2">Room ID</h2>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-2xl font-mono text-white tracking-widest w-full text-center truncate">
                {roomId}
              </div>
              <button 
                onClick={copyRoomId}
                title="IDをコピー"
                className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-xl px-4 transition-colors shrink-0"
              >
                {copiedId ? <Check size={24} /> : <Copy size={24} />}
              </button>
            </div>
            
            <button 
              onClick={copyShareLink}
              className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm py-2 rounded-lg transition-colors border border-slate-600/50"
            >
              {copiedLink ? <Check size={16} /> : <LinkIcon size={16} />}
              {copiedLink ? 'リンクをコピーしました' : '招待リンクをコピー'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">このIDまたはリンクを友達に共有してください</p>
        </div>

        {isHost ? (
          <div className="space-y-4 pt-4 border-t border-slate-700/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Crown size={18} className="text-yellow-400" />
              クイズ設定
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">お題</label>
              <input
                type="text"
                value={config.topic}
                onChange={(e) => onConfigChange({ ...config, topic: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                placeholder="例: アニメ, 科学..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                難易度: {DIFFICULTY_LABELS[config.difficulty]}
              </label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={config.difficulty}
                onChange={(e) => onConfigChange({ ...config, difficulty: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                問題数
              </label>
              <input 
                type="number" 
                min="1" 
                max="30" 
                value={config.count}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) onConfigChange({ ...config, count: Math.min(Math.max(val, 1), 30) });
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4 border-t border-slate-700/50 text-slate-400">
             <h3 className="text-lg font-bold text-white">クイズ設定</h3>
             <p>ホストが設定中です...</p>
             <div className="bg-slate-900/50 p-4 rounded-lg space-y-2 text-sm">
                <p><span className="text-slate-500">お題:</span> {config.topic || '(未定)'}</p>
                <p><span className="text-slate-500">難易度:</span> {DIFFICULTY_LABELS[config.difficulty]}</p>
                <p><span className="text-slate-500">問題数:</span> {config.count}問</p>
             </div>
          </div>
        )}
      </div>

      {/* Right: Player List */}
      <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-xl flex flex-col">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Users className="text-indigo-400" />
          参加者 ({players.length})
        </h2>

        <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px]">
          {players.map((p) => (
            <div 
              key={p.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${p.id === myId ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-800 border-slate-700'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${p.id === myId ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {p.name}
                    {p.id === myId && <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full">YOU</span>}
                  </div>
                  {p.isHost && <div className="text-xs text-yellow-400 flex items-center gap-1"><Crown size={12}/> HOST</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col gap-3">
          {isHost ? (
            <button
              onClick={onStart}
              disabled={!config.topic || players.length < 1} // Allow starting alone for testing
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} />
              ゲーム開始
            </button>
          ) : (
            <div className="text-center text-slate-400 py-4 bg-slate-900/50 rounded-xl animate-pulse">
              ホストが開始するのを待っています...
            </div>
          )}
          <button 
            onClick={onLeave}
            className="text-slate-400 hover:text-white text-sm py-2"
          >
            退出する
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;