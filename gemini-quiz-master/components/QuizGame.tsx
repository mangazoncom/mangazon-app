import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizConfig } from '../types';
import { ChatAssistant } from './ChatAssistant';
import { CheckCircle, XCircle, ArrowRight, HelpCircle, Lightbulb } from 'lucide-react';

interface QuizGameProps {
  questions: QuizQuestion[];
  config: QuizConfig;
  onFinish: (score: number) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({ questions, config, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercentage = ((currentIndex) / questions.length) * 100;

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return; // Prevent changing answer
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onFinish(score);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 h-full flex flex-col justify-center py-8">
      
      {/* Header Area */}
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 mb-2">
              {config.topic}
            </span>
            <h2 className="text-slate-400 font-heading font-medium">Question {currentIndex + 1} <span className="text-slate-600 text-sm">/ {questions.length}</span></h2>
          </div>
          <div className="text-right">
             <span className="text-indigo-400 font-bold text-lg">{score}</span>
             <span className="text-slate-600 text-xs uppercase font-bold ml-1">Points</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${((currentIndex + (selectedOption !== null ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-center min-h-[400px]">
        
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-10 leading-relaxed font-heading z-10">
          {currentQuestion.question}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-10">
          {currentQuestion.options.map((option, idx) => {
            let buttonClass = "p-5 text-left rounded-2xl border transition-all duration-300 font-medium relative group flex items-center justify-between ";
            
            if (selectedOption === null) {
              buttonClass += "bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800 hover:scale-[1.02] text-slate-200 shadow-sm";
            } else {
              if (idx === currentQuestion.correctAnswerIndex) {
                buttonClass += "bg-teal-900/40 border-teal-500/50 text-teal-100 shadow-[0_0_20px_rgba(20,184,166,0.2)]";
              } else if (idx === selectedOption) {
                buttonClass += "bg-rose-900/40 border-rose-500/50 text-rose-100 opacity-60";
              } else {
                buttonClass += "bg-slate-800/30 border-slate-800/30 text-slate-600 grayscale opacity-40 blur-[1px]";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={selectedOption !== null}
                className={buttonClass}
              >
                <span className="pr-4 text-lg">{option}</span>
                {selectedOption !== null && idx === currentQuestion.correctAnswerIndex && (
                  <CheckCircle className="w-6 h-6 text-teal-400 shrink-0 drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
                )}
                {selectedOption !== null && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation Area */}
      <div className={`mt-6 transition-all duration-500 ease-out transform origin-top ${showExplanation ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none absolute'}`}>
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-slate-700/80 flex flex-col md:flex-row items-center gap-6 shadow-xl">
          <div className="flex-1">
            <h3 className="text-indigo-400 font-bold mb-3 flex items-center text-lg">
              <Lightbulb className="w-5 h-5 mr-2" />
              解説
            </h3>
            <p className="text-slate-200 leading-relaxed text-base">
              {currentQuestion.explanation}
            </p>
          </div>
          <button
            onClick={handleNext}
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-indigo-900/30 whitespace-nowrap group"
          >
            {isLastQuestion ? '結果を見る' : '次の問題へ'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Spacer for Explanation to push chat button up if needed, though chat is fixed */}
      <div className="h-24 md:h-0"></div>

      <ChatAssistant 
        currentQuestion={currentQuestion} 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
    </div>
  );
};