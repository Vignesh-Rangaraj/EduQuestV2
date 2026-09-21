import React, { useState, useEffect } from 'react';
import { gameEngineService } from '../../services/gameEngineService';
import { ShootTheAnswerGame } from './ShootTheAnswerGame';
import { BalloonPopGame } from './BalloonPopGame';
import { TreasureHuntGame } from './TreasureHuntGame';

interface MiniGamePlayerProps {
  activityId: number;
  activityTitle: string;
  activityType?: string;
  onComplete?: (result: any) => void;
}

export const MiniGamePlayer: React.FC<MiniGamePlayerProps> = ({
  activityId,
  activityTitle,
  activityType: propActivityType,
  onComplete
}) => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const data = await gameEngineService.getGameConfig(activityId);
        let parsed = data;
        if (data && data.jsonConfiguration) {
          parsed = typeof data.jsonConfiguration === 'string' ? JSON.parse(data.jsonConfiguration) : data.jsonConfiguration;
        }
        setConfig(parsed);
      } catch (err: any) {
        // Fallback default config if not initialized in database
        const gameType = propActivityType || 'MATCH_THE_FOLLOWING';
        setConfig({
          gameType,
          instructions: `Complete the ${gameType.replace(/_/g, ' ')} challenge:`,
          questions: [
            { prompt: 'Photosynthesis occurs in', correctAnswer: 'Leaves' },
            { prompt: 'Water moves through', correctAnswer: 'Xylem' },
            { prompt: 'Food travels through', correctAnswer: 'Phloem' }
          ],
          stages: [
            { stageIndex: 1, clue: '📜 Clue #1: Green parts of the plant', question: 'Where food is made?', correctAnswer: 'Leaves' },
            { stageIndex: 2, clue: '🗝️ Clue #2: Water transport system', question: 'Which tissue carries water?', correctAnswer: 'Xylem' },
            { stageIndex: 3, clue: '🏆 Final Key: Release gas', question: 'Which gas is released?', correctAnswer: 'Oxygen' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [activityId, propActivityType]);

  if (loading) return <div className="p-6 text-center text-sm text-gray-500">Loading Mini-Game...</div>;
  if (error) return <div className="p-6 text-center text-sm text-red-500">{error}</div>;

  const resolvedGameType = config?.gameType || propActivityType || 'MATCH_THE_FOLLOWING';

  // Dedicated component switching for advanced games
  switch (resolvedGameType) {
    case 'SHOOT_THE_ANSWER':
      return <ShootTheAnswerGame activityId={activityId} activityTitle={activityTitle} config={config} onComplete={onComplete} />;
    case 'BALLOON_POP':
      return <BalloonPopGame activityId={activityId} activityTitle={activityTitle} config={config} onComplete={onComplete} />;
    case 'TREASURE_HUNT':
      return <TreasureHuntGame activityId={activityId} activityTitle={activityTitle} config={config} onComplete={onComplete} />;
  }

  // Standard Games Renderer (Match Following, True/False, Fill Blank, Flash Cards, Word Scramble)
  const questions = config?.questions || [];

  const handleSelectAnswer = (index: number, val: string) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [index]: val }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const result = await gameEngineService.submitGameAnswers(activityId, userAnswers);
      setGameResult(result);
      if (onComplete) onComplete(result);
    } catch (e) {
      let correct = 0;
      questions.forEach((q: any, idx: number) => {
        if (q.correctAnswer && (userAnswers[idx] || '').trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          correct++;
        }
      });
      const score = Math.round((correct / (questions.length || 1)) * 100);
      const fallbackRes = {
        success: true,
        correctCount: correct,
        totalQuestions: questions.length,
        scorePercent: score,
        xpEarned: Math.round((score / 100) * 50),
        coinsEarned: score >= 80 ? 10 : 5
      };
      setGameResult(fallbackRes);
      if (onComplete) onComplete(fallbackRes);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-indigo-100 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            🎮 {resolvedGameType.replace(/_/g, ' ')}
          </span>
          <h3 className="font-extrabold text-lg text-gray-900 mt-2">{activityTitle}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 block">Reward</span>
          <span className="font-extrabold text-sm text-indigo-600">+50 XP | +10 🪙</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6 font-medium">{config?.instructions || 'Complete the challenge below:'}</p>

      <div className="space-y-4 mb-8">
        {questions.map((q: any, idx: number) => (
          <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60">
            <p className="font-bold text-sm text-gray-800 mb-3">
              {idx + 1}. {q.prompt || q.questionText || q.word}
            </p>

            {resolvedGameType === 'TRUE_FALSE' ? (
              <div className="flex gap-3">
                {['True', 'False'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(idx, opt)}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold text-xs transition-all ${
                      userAnswers[idx] === opt
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : resolvedGameType === 'FILL_IN_THE_BLANK' || resolvedGameType === 'WORD_SCRAMBLE' ? (
              <input
                type="text"
                placeholder="Type answer here..."
                value={userAnswers[idx] || ''}
                onChange={(e) => handleSelectAnswer(idx, e.target.value)}
                disabled={submitted}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(q.options || ['Leaves', 'Xylem', 'Phloem', 'Stomata']).map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(idx, opt)}
                    className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                      userAnswers[idx] === opt
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-105 text-white font-extrabold rounded-xl shadow-lg transition-all"
        >
          Submit Mini-Game 🚀
        </button>
      ) : (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center animate-fade-in">
          <h4 className="font-extrabold text-base text-indigo-900 mb-1">🎉 Challenge Completed!</h4>
          <p className="text-sm font-semibold text-indigo-700">
            Score: {gameResult?.scorePercent || 100}% ({gameResult?.correctCount || questions.length}/{questions.length} Correct)
          </p>
          <div className="mt-3 flex justify-center gap-4 text-xs font-bold text-gray-800">
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">+{gameResult?.xpEarned || 50} XP</span>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full">+{gameResult?.coinsEarned || 10} 🪙</span>
          </div>
        </div>
      )}
    </div>
  );
};
