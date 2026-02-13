import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean) => void;
  onOpenChat: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswer,
  onOpenChat
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (selectedOption !== null) {
      onAnswer(selectedOption === question.correctIndex);
      // Reset for next question (parent will switch question prop)
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  };

  const getOptionStyle = (index: number) => {
    const baseStyle = "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex justify-between items-center ";
    
    if (!isSubmitted) {
      return baseStyle + (selectedOption === index 
        ? "border-indigo-500 bg-indigo-500/10 text-indigo-100" 
        : "border-slate-700 bg-slate-800 hover:border-slate-500 text-slate-300");
    }

    if (index === question.correctIndex) {
      return baseStyle + "border-green-500 bg-green-500/20 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
    }

    if (selectedOption === index && index !== question.correctIndex) {
      return baseStyle + "border-red-500 bg-red-500/20 text-red-100";
    }

    return baseStyle + "border-slate-800 bg-slate-800/50 text-slate-500 opacity-50";
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <span className="bg-slate-800 text-indigo-400 px-3 py-1 rounded-full text-sm font-medium border border-slate-700">
          Question {questionNumber} / {totalQuestions}
        </span>
        <button 
          onClick={onOpenChat}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <HelpCircle size={18} />
          <span>AIに質問する</span>
        </button>
      </div>

      {/* Question Text */}
      <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
        {question.text}
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={getOptionStyle(idx)}
            disabled={isSubmitted}
          >
            <span className="font-medium">{option}</span>
            {isSubmitted && idx === question.correctIndex && <CheckCircle className="text-green-500" size={20} />}
            {isSubmitted && selectedOption === idx && idx !== question.correctIndex && <XCircle className="text-red-500" size={20} />}
          </button>
        ))}
      </div>

      {/* Explanation Section */}
      {isSubmitted && (
        <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 mb-6 animate-fade-in">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">解説</h3>
          <p className="text-slate-200 leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className={`
              px-8 py-3 rounded-lg font-bold text-white transition-all transform
              ${selectedOption === null 
                ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 shadow-lg shadow-indigo-500/20'}
            `}
          >
            回答する
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 hover:scale-105 shadow-lg shadow-indigo-500/20 transition-all transform"
          >
            {questionNumber === totalQuestions ? '結果を見る' : '次の問題へ'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizCard;