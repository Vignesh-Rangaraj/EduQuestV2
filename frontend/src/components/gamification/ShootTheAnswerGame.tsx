import React, { useState, useEffect } from 'react';
import { gameEngineService } from '../../services/gameEngineService';

interface TargetOption {
  text: string;
  isCorrect: boolean;
  top: number;
  left: number;
}

interface Question {
  prompt: string;
  options: string[];
  correctAnswer: string;
}

interface ShootTheAnswerGameProps {
  activityId: number;
  activityTitle: string;
  config?: any;
  onComplete?: (result: any) => void;
}

export const ShootTheAnswerGame: React.FC<ShootTheAnswerGameProps> = ({
  activityId,
  activityTitle,
  config,
  onComplete
}) => {
  const questions: Question[] = config?.questions || [
    { prompt: 'What is 5 + 5?', options: ['8', '10', '12', '14'], correctAnswer: '10' },
    { prompt: 'Which gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Helium'], correctAnswer: 'Carbon Dioxide' },
    { prompt: 'What is 12 ÷ 4?', options: ['2', '3', '4', '6'], correctAnswer: '3' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [targets, setTargets] = useState<TargetOption[]>([]);
  const [hitIndex, setHitIndex] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [shotsFired, setShotsFired] = useState(0);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!currentQuestion) return;
    // Randomize target positions for options
    const positions = [
      { top: 20, left: 15 },
      { top: 25, left: 60 },
      { top: 60, left: 25 },
      { top: 65, left: 70 }
    ].sort(() => Math.random() - 0.5);

    const generated = currentQuestion.options.map((opt, idx) => ({
      text: opt,
      isCorrect: opt.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase(),
      top: positions[idx % positions.length].top,
      left: positions[idx % positions.length].left
    }));
    setTargets(generated);
    setHitIndex(null);
  }, [currentIndex]);

  const handleShootTarget = (targetIdx: number, selectedText: string) => {
    if (hitIndex !== null || completed) return;
    setHitIndex(targetIdx);
    setShotsFired((prev) => prev + 1);

    const newAnswers = { ...userAnswers, [currentIndex]: selectedText };
    setUserAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        finishGame(newAnswers);
      }
    }, 900);
  };

  const finishGame = async (answers: Record<number, string>) => {
    setCompleted(true);
    let correct = 0;
    questions.forEach((q, idx) => {
      if ((answers[idx] || '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correct++;
      }
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    const xpEarned = Math.round((scorePercent / 100) * 50);
    const coinsEarned = scorePercent >= 80 ? 10 : 5;

    try {
      const res = await gameEngineService.submitGameAnswers(activityId, {
        gameType: 'SHOOT_THE_ANSWER',
        answers,
        scorePercent,
        xpEarned,
        coinsEarned
      });
      setResult(res);
      if (onComplete) onComplete(res);
    } catch (e) {
      const fallback = {
        success: true,
        gameType: 'SHOOT_THE_ANSWER',
        correctCount: correct,
        totalQuestions: questions.length,
        scorePercent,
        xpEarned,
        coinsEarned
      };
      setResult(fallback);
      if (onComplete) onComplete(fallback);
    }
  };

  if (completed && result) {
    const accuracy = shotsFired > 0 ? Math.round((result.correctCount / shotsFired) * 100) : 100;

    return (
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl border border-indigo-500/30 max-w-xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center text-4xl animate-bounce">
          🎯
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
            Shoot The Answer • Complete
          </span>
          <h3 className="text-2xl font-extrabold mt-3">{activityTitle}</h3>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold">Accuracy</p>
            <p className="text-xl font-black text-emerald-400">{accuracy}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold">Score</p>
            <p className="text-xl font-black text-sky-400">{result.scorePercent}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold">Target Hits</p>
            <p className="text-xl font-black text-amber-400">{result.correctCount}/{result.totalQuestions}</p>
          </div>
        </div>

        <div className="flex justify-center gap-4 text-sm font-bold">
          <span className="bg-indigo-600/40 border border-indigo-400 text-indigo-200 px-4 py-1.5 rounded-full">
            +{result.xpEarned} XP
          </span>
          <span className="bg-amber-500/40 border border-amber-400 text-amber-200 px-4 py-1.5 rounded-full">
            +{result.coinsEarned} 🪙 Coins
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-white p-6 rounded-2xl border border-indigo-500/40 shadow-2xl max-w-2xl mx-auto select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            🎯 Target Shooter
          </span>
          <h3 className="font-extrabold text-base text-gray-100">{activityTitle}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block">Question</span>
          <span className="font-extrabold text-indigo-400 text-sm">{currentIndex + 1} / {questions.length}</span>
        </div>
      </div>

      {/* Question Banner */}
      <div className="bg-gradient-to-r from-indigo-900/80 to-blue-900/80 p-4 rounded-xl border border-indigo-500/40 text-center mb-6 shadow">
        <p className="text-xs text-indigo-300 font-bold uppercase tracking-wide">Target Question</p>
        <h4 className="text-lg font-black text-white mt-1">{currentQuestion.prompt}</h4>
      </div>

      {/* Target Arena Area */}
      <div className="relative w-full h-72 bg-slate-900/90 rounded-2xl border-2 border-dashed border-indigo-500/30 overflow-hidden shadow-inner">
        {/* Crosshair Cursor Guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-48 h-48 rounded-full border-2 border-indigo-400 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-indigo-400"></div>
          </div>
        </div>

        {/* Floating Targets */}
        {targets.map((t, idx) => {
          const isHit = hitIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => handleShootTarget(idx, t.text)}
              disabled={hitIndex !== null}
              style={{ top: `${t.top}%`, left: `${t.left}%` }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-5 py-3 rounded-full font-black text-sm transition-all duration-300 shadow-xl flex items-center space-x-2 border-2 ${
                isHit
                  ? t.isCorrect
                    ? 'bg-emerald-500 border-emerald-300 text-white scale-125 animate-ping'
                    : 'bg-red-600 border-red-400 text-white scale-125 animate-bounce'
                  : 'bg-gradient-to-br from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600 border-indigo-300 text-white hover:scale-110 active:scale-95'
              }`}
            >
              <span>🎯</span>
              <span>{t.text}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-medium px-2">
        <span>Click the target matching the correct answer!</span>
        <span>Accuracy: {shotsFired > 0 ? Math.round(((userAnswers[0] ? 1 : 0) / shotsFired) * 100) : 100}%</span>
      </div>
    </div>
  );
};
