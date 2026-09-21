import React, { useState, useEffect } from 'react';
import { gameEngineService } from '../../services/gameEngineService';

interface BalloonItem {
  id: number;
  text: string;
  color: string;
  isCorrect: boolean;
  leftPercent: number;
  speedSec: number;
}

interface Question {
  prompt: string;
  options: string[];
  correctAnswer: string;
}

interface BalloonPopGameProps {
  activityId: number;
  activityTitle: string;
  config?: any;
  onComplete?: (result: any) => void;
}

const BALLOON_COLORS = [
  'bg-pink-500 border-pink-300',
  'bg-purple-500 border-purple-300',
  'bg-cyan-500 border-cyan-300',
  'bg-amber-500 border-amber-300',
  'bg-emerald-500 border-emerald-300'
];

export const BalloonPopGame: React.FC<BalloonPopGameProps> = ({
  activityId,
  activityTitle,
  config,
  onComplete
}) => {
  const questions: Question[] = config?.questions || [
    { prompt: 'What is the capital of India?', options: ['Delhi', 'Mumbai', 'Chennai', 'Kolkata'], correctAnswer: 'Delhi' },
    { prompt: 'Which organ pumps blood in human body?', options: ['Brain', 'Heart', 'Lungs', 'Liver'], correctAnswer: 'Heart' },
    { prompt: 'What is 8 × 7?', options: ['48', '54', '56', '64'], correctAnswer: '56' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [poppedId, setPoppedId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!currentQuestion || completed) return;
    setTimeLeft(15);
    setPoppedId(null);

    const generated: BalloonItem[] = currentQuestion.options.map((opt, idx) => ({
      id: idx,
      text: opt,
      color: BALLOON_COLORS[idx % BALLOON_COLORS.length],
      isCorrect: opt.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase(),
      leftPercent: 12 + idx * 22,
      speedSec: 3 + Math.random() * 2
    }));
    setBalloons(generated);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNextQuestion({});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, completed]);

  const handlePopBalloon = (balloon: BalloonItem) => {
    if (poppedId !== null || completed) return;
    setPoppedId(balloon.id);

    const newAnswers = { ...userAnswers, [currentIndex]: balloon.text };
    setUserAnswers(newAnswers);

    setTimeout(() => {
      handleNextQuestion(newAnswers);
    }, 700);
  };

  const handleNextQuestion = (latestAnswers: Record<number, string>) => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishGame(latestAnswers);
    }
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
        gameType: 'BALLOON_POP',
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
        gameType: 'BALLOON_POP',
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
    return (
      <div className="bg-gradient-to-b from-sky-900 to-indigo-950 text-white p-8 rounded-2xl shadow-2xl border border-sky-400/30 max-w-xl mx-auto text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-sky-500/30 border-2 border-sky-300 flex items-center justify-center text-4xl animate-bounce">
          🎈
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-300 bg-sky-900 px-3 py-1 rounded-full border border-sky-700">
            Balloon Pop • Completed
          </span>
          <h3 className="text-2xl font-extrabold mt-3">{activityTitle}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-sky-950/80 p-4 rounded-xl border border-sky-800">
          <div>
            <p className="text-[10px] uppercase text-sky-300 font-bold">Accuracy Score</p>
            <p className="text-2xl font-black text-emerald-400">{result.scorePercent}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-sky-300 font-bold">Balloons Popped</p>
            <p className="text-2xl font-black text-amber-300">{result.correctCount}/{result.totalQuestions}</p>
          </div>
        </div>

        <div className="flex justify-center gap-4 text-sm font-bold">
          <span className="bg-sky-600/40 border border-sky-400 text-sky-200 px-4 py-1.5 rounded-full">
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
    <div className="bg-gradient-to-b from-sky-900 via-indigo-900 to-slate-950 text-white p-6 rounded-2xl border border-sky-400/30 shadow-2xl max-w-2xl mx-auto select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-sky-800 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
            🎈 Floating Balloon Pop
          </span>
          <h3 className="font-extrabold text-base text-gray-100">{activityTitle}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-sky-950/70 border border-sky-700 px-3 py-1 rounded-full text-xs font-bold text-sky-200">
            ⏳ {timeLeft}s
          </div>
          <div className="text-right text-xs">
            <span className="text-gray-400 block">Question</span>
            <span className="font-extrabold text-sky-300">{currentIndex + 1} / {questions.length}</span>
          </div>
        </div>
      </div>

      {/* Question Header */}
      <div className="bg-sky-950/80 p-4 rounded-xl border border-sky-600/40 text-center mb-6 shadow">
        <p className="text-xs text-sky-300 font-bold uppercase tracking-wide">Pop the correct balloon</p>
        <h4 className="text-lg font-black text-white mt-1">{currentQuestion.prompt}</h4>
      </div>

      {/* Floating Balloon Stage */}
      <div className="relative w-full h-72 bg-gradient-to-b from-sky-950/60 to-indigo-950/80 rounded-2xl border-2 border-sky-500/30 overflow-hidden shadow-inner">
        {balloons.map((b) => {
          const isPopped = poppedId === b.id;
          return (
            <div
              key={b.id}
              style={{
                left: `${b.leftPercent}%`,
                animationDuration: `${b.speedSec}s`
              }}
              className="absolute bottom-4 transform -translate-x-1/2 flex flex-col items-center animate-bounce"
            >
              <button
                onClick={() => handlePopBalloon(b)}
                disabled={poppedId !== null}
                className={`w-20 h-24 rounded-full flex flex-col items-center justify-center font-black text-xs text-white shadow-2xl border-2 transition-all duration-300 ${b.color} ${
                  isPopped
                    ? b.isCorrect
                      ? 'scale-150 opacity-0 transition-opacity'
                      : 'scale-90 bg-red-600 border-red-400'
                    : 'hover:scale-110 active:scale-95'
                }`}
              >
                <span>{b.text}</span>
                <span className="text-[10px] opacity-70 mt-1">🎈</span>
              </button>
              {/* String */}
              <div className="w-0.5 h-10 bg-sky-200/40 mt-1"></div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-sky-300 font-medium px-2">
        <span>Click to pop the balloon with the correct answer!</span>
        <span>Question {currentIndex + 1} of {questions.length}</span>
      </div>
    </div>
  );
};
