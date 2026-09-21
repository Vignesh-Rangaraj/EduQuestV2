import React, { useState } from 'react';
import { gameEngineService } from '../../services/gameEngineService';

interface TreasureStage {
  stageIndex: number;
  clue: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface TreasureHuntGameProps {
  activityId: number;
  activityTitle: string;
  config?: any;
  onComplete?: (result: any) => void;
}

export const TreasureHuntGame: React.FC<TreasureHuntGameProps> = ({
  activityId,
  activityTitle,
  config,
  onComplete
}) => {
  const stages: TreasureStage[] = config?.stages || [
    {
      stageIndex: 1,
      clue: '📜 Clue #1: Search in the green leaves of the plant where food is prepared.',
      question: 'Which process occurs in green leaves to make food?',
      options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Evaporation'],
      correctAnswer: 'Photosynthesis'
    },
    {
      stageIndex: 2,
      clue: '🗝️ Clue #2: Follow the water channels flowing from roots up through the stem.',
      question: 'Which plant tissue transports water from roots to leaves?',
      options: ['Phloem', 'Xylem', 'Stomata', 'Epidermis'],
      correctAnswer: 'Xylem'
    },
    {
      stageIndex: 3,
      clue: '🏆 Final Map Key: Unlock the Golden Treasure Chest!',
      question: 'Which gas is released by plants during photosynthesis?',
      options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Methane'],
      correctAnswer: 'Oxygen'
    }
  ];

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [completed, setCompleted] = useState(false);
  const [chestOpened, setChestOpened] = useState(false);
  const [result, setResult] = useState<any>(null);

  const currentStage = stages[currentStageIndex];

  const handleNextStage = () => {
    if (!selectedOption) return;
    const newAnswers = { ...userAnswers, [currentStageIndex]: selectedOption };
    setUserAnswers(newAnswers);
    setSelectedOption('');

    if (currentStageIndex + 1 < stages.length) {
      setCurrentStageIndex((prev) => prev + 1);
    } else {
      finishHunt(newAnswers);
    }
  };

  const finishHunt = async (answers: Record<number, string>) => {
    setCompleted(true);
    let correct = 0;
    stages.forEach((s, idx) => {
      if ((answers[idx] || '').trim().toLowerCase() === s.correctAnswer.trim().toLowerCase()) {
        correct++;
      }
    });

    const scorePercent = Math.round((correct / stages.length) * 100);
    const xpEarned = Math.round((scorePercent / 100) * 60);
    const coinsEarned = scorePercent >= 80 ? 15 : 8;

    try {
      const res = await gameEngineService.submitGameAnswers(activityId, {
        gameType: 'TREASURE_HUNT',
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
        gameType: 'TREASURE_HUNT',
        correctCount: correct,
        totalQuestions: stages.length,
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
      <div className="bg-gradient-to-b from-amber-950 via-yellow-950 to-slate-950 text-white p-8 rounded-2xl shadow-2xl border border-amber-500/40 max-w-xl mx-auto text-center space-y-6">
        <div className="relative inline-block">
          <button
            onClick={() => setChestOpened(true)}
            className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-5xl border-4 border-amber-200 shadow-2xl transition-all duration-500 ${
              chestOpened ? 'scale-110 rotate-6 ring-4 ring-yellow-300' : 'animate-bounce cursor-pointer'
            }`}
          >
            {chestOpened ? '💎' : '🎁'}
          </button>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-900/60 px-3.5 py-1 rounded-full border border-amber-700">
            🏴‍☠️ Treasure Hunt Master
          </span>
          <h3 className="text-2xl font-black text-amber-200 mt-3">{activityTitle}</h3>
          <p className="text-xs text-amber-100/80 mt-1">
            {chestOpened ? 'Golden Treasure Chest Unlocked!' : 'Click the Treasure Chest to claim rewards!'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-amber-950/60 p-4 rounded-xl border border-amber-800/60">
          <div>
            <p className="text-[10px] uppercase text-amber-300 font-bold">Map Clues Solved</p>
            <p className="text-2xl font-black text-emerald-400">{result.correctCount} / {result.totalQuestions}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-amber-300 font-bold">Accuracy</p>
            <p className="text-2xl font-black text-amber-300">{result.scorePercent}%</p>
          </div>
        </div>

        <div className="flex justify-center gap-4 text-sm font-bold">
          <span className="bg-amber-600/40 border border-amber-400 text-amber-200 px-4 py-1.5 rounded-full">
            +{result.xpEarned} Bonus XP
          </span>
          <span className="bg-yellow-500/40 border border-yellow-300 text-yellow-200 px-4 py-1.5 rounded-full">
            +{result.coinsEarned} 🪙 Gold Coins
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-amber-950 via-stone-900 to-slate-950 text-white p-6 rounded-2xl border border-amber-500/40 shadow-2xl max-w-2xl mx-auto select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-800/60 mb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            🏴‍☠️ Treasure Hunt Adventure
          </span>
          <h3 className="font-extrabold text-base text-amber-100">{activityTitle}</h3>
        </div>
        <div className="text-right text-xs">
          <span className="text-amber-300/80 block">Stage Progress</span>
          <span className="font-extrabold text-amber-400">
            Step {currentStageIndex + 1} of {stages.length}
          </span>
        </div>
      </div>

      {/* Stage Stepper Map Header */}
      <div className="flex items-center justify-between mb-6 bg-amber-900/30 p-3 rounded-xl border border-amber-700/50">
        {stages.map((st, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                idx === currentStageIndex
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-md animate-pulse'
                  : idx < currentStageIndex
                  ? 'bg-emerald-500 text-white'
                  : 'bg-stone-800 text-stone-500'
              }`}
            >
              {idx < currentStageIndex ? '✓' : idx + 1}
            </div>
            <span className="text-xs font-semibold text-amber-200 hidden sm:inline">Stage {idx + 1}</span>
          </div>
        ))}
      </div>

      {/* Clue Box */}
      <div className="bg-amber-950/70 p-4 rounded-xl border border-amber-600/50 mb-5 text-amber-100 shadow">
        <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">Lesson Clue</p>
        <p className="text-sm font-medium">{currentStage.clue}</p>
      </div>

      {/* Question & Options */}
      <div className="bg-stone-900/80 p-5 rounded-xl border border-amber-700/40 space-y-4 mb-6">
        <h4 className="font-bold text-sm text-amber-50">
          Q: {currentStage.question}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentStage.options.map((opt) => {
            const isSelected = selectedOption === opt;
            return (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt)}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow-lg scale-102'
                    : 'bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-750 hover:border-amber-500/50'
                }`}
              >
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleNextStage}
        disabled={!selectedOption}
        className={`w-full py-3 rounded-xl font-extrabold text-sm transition-all shadow-lg ${
          selectedOption
            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110'
            : 'bg-stone-800 text-stone-500 cursor-not-allowed'
        }`}
      >
        {currentStageIndex + 1 < stages.length ? 'Unlock Next Stage Clue 🗝️' : 'Unlock Treasure Chest 🎁'}
      </button>
    </div>
  );
};
