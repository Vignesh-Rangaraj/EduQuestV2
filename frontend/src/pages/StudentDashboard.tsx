import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { moduleService } from '../services/moduleService';
import { leaderboardService } from '../services/leaderboardService';
import { gamificationService } from '../services/gamificationService';
import { offlineProgressRepository } from '../offline/offlineProgressRepository';
import { syncService } from '../offline/syncService';
import { ContinueLearningCard } from '../components/student/ContinueLearningCard';
import { LevelProgressBar } from '../components/gamification/LevelProgressBar';
import { StreakWidget } from '../components/gamification/StreakWidget';
import { CoinWalletBadge } from '../components/gamification/CoinWalletBadge';
import { DailyMissionsWidget } from '../components/gamification/DailyMissionsWidget';
import { JourneyMap } from '../components/gamification/JourneyMap';
import { MiniGamePlayer } from '../components/gamification/MiniGamePlayer';

import {
  Student,
  Module,
  Activity,
  QuizQuestion,
  LeaderboardEntry,
  GamificationSummary,
  DailyMission,
  JourneyStage
} from '../types';
import { NetworkStatusBadge } from '../components/NetworkStatusBadge';
import {
  UserCheck,
  BookOpen,
  CheckCircle,
  Play,
  Trophy,
  Lock,
  Clock,
  Gamepad2,
  X,
  HelpCircle,
  Circle
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Student | null>(null);
  const [gamification, setGamification] = useState<GamificationSummary | null>(null);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [journeyStages, setJourneyStages] = useState<JourneyStage[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [moduleActivities, setModuleActivities] = useState<Activity[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, { completed: boolean; score: number; bestScore: number; synced: boolean }>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardScope, setLeaderboardScope] = useState<'CLASSROOM' | 'SCHOOL'>('CLASSROOM');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [activeQuiz, setActiveQuiz] = useState<{ activity: Activity; questions: QuizQuestion[] } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean; correct: number; total: number } | null>(null);
  const [activeGamePreview, setActiveGamePreview] = useState<Activity | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const loadGamificationData = async () => {
    try {
      const [sum, missions, journey] = await Promise.all([
        gamificationService.getSummary(),
        gamificationService.getDailyMissions(),
        gamificationService.getJourneyMap()
      ]);
      setGamification(sum);
      setDailyMissions(missions);
      setJourneyStages(journey);
    } catch (e) {
      console.error('Failed to load gamification summary', e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const studentData = await studentService.getProfile();
      setProfile(studentData);

      const [modList, lbList] = await Promise.all([
        moduleService.getStudentModules(),
        leaderboardService.getLeaderboard(leaderboardScope)
      ]);

      setModules(modList);
      setLeaderboard(lbList);

      if (modList.length > 0) {
        const firstMod = modList[0];
        setSelectedModule(firstMod);
        const acts = await moduleService.getModuleActivities(firstMod.id);
        setModuleActivities(acts);
      }

      if (studentData?.id) {
        const localProgress = await offlineProgressRepository.getStudentProgress(studentData.id);
        const map: Record<number, { completed: boolean; score: number; bestScore: number; synced: boolean }> = {};
        localProgress.forEach((p) => {
          map[p.activityId] = {
            completed: p.completed,
            score: p.score,
            bestScore: p.bestScore || p.score,
            synced: p.synced
          };
        });
        setProgressMap(map);
      }

      await loadGamificationData();
    } catch (err) {
      console.error('Error loading student dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribeSync = syncService.subscribe(() => {
      if (profile?.id) {
        offlineProgressRepository.getStudentProgress(profile.id).then((localProgress) => {
          const map: Record<number, { completed: boolean; score: number; bestScore: number; synced: boolean }> = {};
          localProgress.forEach((p) => {
            map[p.activityId] = {
              completed: p.completed,
              score: p.score,
              bestScore: p.bestScore || p.score,
              synced: p.synced
            };
          });
          setProgressMap(map);
        });
        leaderboardService.getLeaderboard(leaderboardScope).then(setLeaderboard).catch(() => {});
        loadGamificationData();
      }
    });

    return () => {
      unsubscribeSync();
    };
  }, [profile?.id]);

  useEffect(() => {
    if (selectedModule) {
      moduleService.getModuleActivities(selectedModule.id).then(setModuleActivities).catch(() => {});
    }
  }, [selectedModule]);

  useEffect(() => {
    leaderboardService.getLeaderboard(leaderboardScope).then(setLeaderboard).catch(() => {});
  }, [leaderboardScope]);

  const handleSelectModule = (mod: Module) => {
    setSelectedModule(mod);
  };

  const handleOpenActivity = async (act: Activity, isUnlocked: boolean) => {
    if (!isUnlocked) return;

    if (act.activityType === 'LESSON') {
      navigate(`/student/lesson/${act.id}`);
    } else if (act.activityType === 'QUIZ') {
      try {
        const questions = await moduleService.getQuizQuestions(act.id);
        setActiveQuiz({ activity: act, questions });
        setQuizAnswers({});
        setQuizResult(null);
      } catch (e) {
        alert('Could not load quiz questions.');
      }
    } else {
      setActiveGamePreview(act);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !profile?.id) return;

    setSubmittingQuiz(true);
    const questions = activeQuiz.questions;
    let correctCount = 0;

    questions.forEach((q) => {
      if (quizAnswers[q.id!] === q.correctAnswer) {
        correctCount++;
      }
    });

    const total = questions.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 100;
    const passed = score >= 50;
    const completedAt = new Date().toISOString();
    const act = activeQuiz.activity;

    setQuizResult({ score, passed, correct: correctCount, total });

    if (passed) {
      const progressId = `${profile.id}-${act.id}`;
      const existingProg = progressMap[act.id];
      const bestScore = Math.max(existingProg?.bestScore || 0, score);

      await offlineProgressRepository.saveProgress({
        id: progressId,
        studentId: profile.id,
        activityId: act.id,
        score,
        completed: true,
        completedAt,
        synced: false
      });

      setProgressMap((prev) => ({
        ...prev,
        [act.id]: { completed: true, score, bestScore, synced: false }
      }));

      const xpReward = act.xpReward || 20;
      setProfile((prev) => prev ? { ...prev, xp: (prev.xp || 0) + xpReward } : null);

      await syncService.enqueueAction('COMPLETE_ACTIVITY', {
        studentId: profile.id,
        activityId: act.id,
        score,
        userAnswers: quizAnswers,
        completedAt
      });

      await loadGamificationData();
    }

    setSubmittingQuiz(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  const currentXp = gamification?.xp || profile?.xp || 0;
  const currentLevel = gamification?.level || profile?.level || 1;
  const currentStreak = gamification?.currentStreak || 0;
  const highestStreak = gamification?.highestStreak || 0;
  const coins = gamification?.coins || 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Navigation & Status Bar with Streak and Coins */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Learning Portal</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Classroom: {profile?.classroomName} • EduQuest Demo School</p>
        </div>
        <div className="flex items-center gap-3">
          <StreakWidget currentStreak={currentStreak} highestStreak={highestStreak} />
          <CoinWalletBadge coins={coins} />
          <NetworkStatusBadge />
        </div>
      </div>

      {/* Student Banner & Gamified Level Progress Bar */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <UserCheck className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{profile?.fullName}</h2>
            <p className="text-sky-100 text-sm mt-0.5">Class {profile?.classroomName} • Parent: {profile?.parentFullName}</p>
          </div>
        </div>

        <div className="w-full md:w-80">
          <LevelProgressBar level={currentLevel} xp={currentXp} levelProgress={gamification?.levelProgress} />
        </div>
      </div>

      {/* Interactive 6-Stage Learning Journey Map */}
      <JourneyMap stages={journeyStages} />

      {/* Continue Learning Top Card */}
      <ContinueLearningCard onContinue={(lessonId) => navigate(`/student/lesson/${lessonId}`)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area: Subject Modules & Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module Selector Grid */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              Learning Modules
            </h2>

            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => handleSelectModule(mod)}
                  className={`flex-shrink-0 px-4 py-3 rounded-2xl border transition-all text-left w-52 ${
                    selectedModule?.id === mod.id
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-sky-300'
                  }`}
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedModule?.id === mod.id ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  }`}>
                    {mod.subject}
                  </span>
                  <h3 className="text-sm font-bold mt-2 line-clamp-1">{mod.title}</h3>
                  <div className="flex items-center space-x-2 text-xs mt-1 opacity-80">
                    <Clock className="w-3 h-3" />
                    <span>{mod.estimatedMinutes || 45} mins</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Learning Path View for Selected Module */}
          {selectedModule && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {selectedModule.subject} • {selectedModule.difficultyLevel}
                  </span>
                  <span className="text-xs text-gray-400">Sequential Learning Path</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{selectedModule.title}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedModule.description}</p>
              </div>

              {/* Sequential Activity Step Progression */}
              <div className="space-y-3 pt-2">
                {moduleActivities.map((act, index) => {
                  const prog = progressMap[act.id];
                  const isCompleted = prog?.completed;

                  let isUnlocked = index === 0;
                  if (index > 0) {
                    const prevActivity = moduleActivities[index - 1];
                    isUnlocked = !!progressMap[prevActivity.id]?.completed;
                  }

                  let statusBadge = 'LOCKED';
                  if (isCompleted) {
                    statusBadge = 'COMPLETED';
                  } else if (isUnlocked) {
                    statusBadge = index === 0 || progressMap[moduleActivities[index - 1]?.id]?.completed ? 'CURRENT' : 'NOT_STARTED';
                  }

                  return (
                    <div
                      key={act.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        statusBadge === 'LOCKED'
                          ? 'bg-gray-50 dark:bg-gray-850 border-gray-200 dark:border-gray-750 opacity-60'
                          : statusBadge === 'COMPLETED'
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                          : statusBadge === 'CURRENT'
                          ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-300 dark:border-sky-700 shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`p-3 rounded-xl ${
                          statusBadge === 'LOCKED'
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                            : statusBadge === 'COMPLETED'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
                            : statusBadge === 'CURRENT'
                            ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-600'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {statusBadge === 'LOCKED' ? (
                            <Lock className="w-5 h-5" />
                          ) : statusBadge === 'COMPLETED' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : statusBadge === 'CURRENT' ? (
                            <Play className="w-5 h-5 fill-current" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-gray-400">Step {index + 1}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              statusBadge === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : statusBadge === 'CURRENT'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                : statusBadge === 'LOCKED'
                                ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {statusBadge === 'COMPLETED' ? '✓ Completed' : statusBadge === 'CURRENT' ? '▶ Current' : statusBadge === 'LOCKED' ? '🔒 Locked' : '○ Not Started'}
                            </span>
                            <span className="text-[10px] font-bold text-amber-500">+{act.xpReward || 10} XP</span>
                          </div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{act.title}</h3>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleOpenActivity(act, isUnlocked)}
                          disabled={statusBadge === 'LOCKED'}
                          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all ${
                            statusBadge === 'LOCKED'
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                              : statusBadge === 'COMPLETED'
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                              : 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-sm'
                          }`}
                        >
                          {statusBadge === 'LOCKED' ? (
                            <span>Locked</span>
                          ) : statusBadge === 'COMPLETED' ? (
                            <span>Review</span>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Start</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Widgets: Daily Missions & Leaderboard */}
        <div className="space-y-6">
          <DailyMissionsWidget missions={dailyMissions} onRewardClaimed={loadGamificationData} />

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                🏆 Top Students Leaderboard
              </h2>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setLeaderboardScope('CLASSROOM')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  leaderboardScope === 'CLASSROOM'
                    ? 'bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                My Class (6-A)
              </button>
              <button
                onClick={() => setLeaderboardScope('SCHOOL')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  leaderboardScope === 'SCHOOL'
                    ? 'bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                School Wide
              </button>
            </div>

            <div className="space-y-2.5">
              {leaderboard.slice(0, 5).map((entry) => (
                <div
                  key={entry.studentId}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                    entry.studentId === profile?.id
                      ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 font-bold'
                      : 'bg-gray-50/50 dark:bg-gray-750/30 border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold ${
                      entry.rank === 1 ? 'bg-amber-100 text-amber-700' : entry.rank === 2 ? 'bg-gray-200 text-gray-700' : entry.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {entry.rank}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{entry.studentName}</p>
                      <p className="text-[10px] text-gray-400">Class {entry.classroomName} • Lvl {entry.level}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-amber-500">{entry.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 4-Option Quiz Runner Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{activeQuiz.activity.title}</h3>
              </div>
              <button onClick={() => setActiveQuiz(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {quizResult ? (
              <div className="text-center py-6 space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                  quizResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {quizResult.passed ? <CheckCircle className="w-10 h-10" /> : <HelpCircle className="w-10 h-10" />}
                </div>

                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {quizResult.passed ? 'Quiz Passed!' : 'Try Again! (Score < 50%)'}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Score: <span className="font-bold text-sky-600">{quizResult.score}%</span> ({quizResult.correct} / {quizResult.total} correct)
                  </p>
                </div>

                {quizResult.passed ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    🎉 Earned +{activeQuiz.activity.xpReward || 20} XP! Next step in module unlocked.
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    A minimum score of 50% is required to complete the quiz and earn XP.
                  </p>
                )}

                <div className="pt-4 flex justify-center space-x-3">
                  <button
                    onClick={() => { setQuizResult(null); setQuizAnswers({}); }}
                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                  >
                    Re-take Quiz
                  </button>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeQuiz.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-2 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Q{idx + 1}. {q.questionText}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {['A', 'B', 'C', 'D'].map((optKey) => {
                        const optText = optKey === 'A' ? q.optionA : optKey === 'B' ? q.optionB : optKey === 'C' ? q.optionC : q.optionD;
                        const isSelected = quizAnswers[q.id!] === optKey;

                        return (
                          <button
                            key={optKey}
                            type="button"
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id!]: optKey }))}
                            className={`p-3 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-purple-100 text-purple-900 border-purple-500 font-bold dark:bg-purple-900/40 dark:text-purple-200'
                                : 'bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-300'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{optKey}.</span> {optText}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-400">Passing Score: 50%</span>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submittingQuiz || Object.keys(quizAnswers).length < activeQuiz.questions.length}
                    className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
                      submittingQuiz || Object.keys(quizAnswers).length < activeQuiz.questions.length
                        ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mini-Game Modal */}
      {activeGamePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl relative">
            <button
              onClick={() => setActiveGamePreview(null)}
              className="absolute -top-3 -right-3 z-10 p-2 bg-white rounded-full shadow text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
            <MiniGamePlayer
              activityId={activeGamePreview.id}
              activityTitle={activeGamePreview.title}
              onComplete={() => {
                loadGamificationData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
