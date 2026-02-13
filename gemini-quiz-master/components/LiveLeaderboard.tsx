import React from 'react';
import { Player } from '../types';
import { Users, CheckCircle, Crown } from 'lucide-react';

interface LiveLeaderboardProps {
  players: Player[];
  myId: string;
  totalQuestions: number;
}

const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({ players, myId, totalQuestions }) => {
  // Sort by score (desc), then by progress
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score || b.currentQuestionIndex - a.currentQuestionIndex);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl p-4 w-full mb-6">
      <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
        <Users size={14} />
        ライブ順位
      </h3>
      <div className="space-y-2">
        {sortedPlayers.map((p, idx) => (
          <div key={p.id} className="flex items-center gap-3 text-sm">
            <span className={`font-mono font-bold w-4 text-center ${idx === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
              {idx + 1}
            </span>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-bold ${p.id === myId ? 'text-indigo-400' : 'text-slate-300'}`}>
                  {p.name}
                  {p.id === myId && " (You)"}
                </span>
                <span className="font-mono text-slate-400">
                  {p.score}pts
                </span>
              </div>
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${p.finished ? 'bg-green-500' : 'bg-indigo-500'}`}
                  style={{ width: `${Math.min((p.currentQuestionIndex / totalQuestions) * 100, 100)}%` }}
                />
              </div>
            </div>
            {p.finished && <CheckCircle size={14} className="text-green-500" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveLeaderboard;