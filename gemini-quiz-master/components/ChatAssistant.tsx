import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, MessageCircleQuestion, Sparkles } from 'lucide-react';
import { ChatMessage, QuizQuestion } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatAssistantProps {
  currentQuestion: QuizQuestion;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ currentQuestion, isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '何かヒントが必要ですか？この問題について何でも聞いてください！' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat when question changes
  useEffect(() => {
    setMessages([{ role: 'model', text: '何かヒントが必要ですか？この問題について何でも聞いてください！' }]);
  }, [currentQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    // Convert internal message format to Gemini history format
    const historyForApi = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const responseText = await sendChatMessage(userMsg, currentQuestion, historyForApi);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'エラーが発生しました。もう一度お試しください。' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 group flex items-center justify-center p-1 rounded-full hover:scale-105 transition-all duration-300 z-50"
      >
        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
        <div className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg shadow-indigo-900/50 relative">
          <MessageCircleQuestion className="w-7 h-7" />
          {/* Notification badge simulation if wanted */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-slate-900 rounded-full"></span>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[400px] max-w-[90vw] h-[600px] max-h-[80vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 animate-fade-in-up origin-bottom-right">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900/50 p-5 border-b border-slate-700/50 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">AI ヒント</h3>
            <div className="flex items-center text-xs text-indigo-300">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-1.5 animate-pulse"></span>
              Online
            </div>
          </div>
        </div>
        <button 
          onClick={onToggle}
          className="bg-slate-800/50 hover:bg-slate-700 p-2 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-900/50 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-900/20'
                  : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700/50'
              }`}
            >
              {msg.role === 'model' && idx === 0 && (
                <div className="flex items-center mb-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gemini AI
                </div>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-5 py-4 flex space-x-1.5 border border-slate-700/50">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex items-end space-x-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="AIに質問する..."
            className="flex-1 bg-transparent text-white placeholder-slate-500 px-3 py-2.5 focus:outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-lg shadow-indigo-900/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};