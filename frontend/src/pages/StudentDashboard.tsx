import React, { useEffect, useState } from 'react';
import { studentService } from '../services/studentService';
import { activityService } from '../services/activityService';
import { offlineProgressRepository } from '../offline/offlineProgressRepository';
import { syncService } from '../offline/syncService';
import { Student, Activity, StudentProgress } from '../types';
import { NetworkStatusBadge } from '../components/NetworkStatusBadge';
import { UserCheck, BookOpen, CheckCircle, Play, FileText, Award } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<Student | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, { completed: boolean; score: number; synced: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const studentData = await studentService.getProfile();
      setProfile(studentData);

      const activityList = await activityService.getStudentActivities();
      setActivities(activityList);

      if (studentData?.id) {
        const localProgress = await offlineProgressRepository.getStudentProgress(studentData.id);
        const map: Record<number, { completed: boolean; score: number; synced: boolean }> = {};
        localProgress.forEach((p) => {
          map[p.activityId] = {
            completed: p.completed,
            score: p.score,
            synced: p.synced
          };
        });
        setProgressMap(map);
      }
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
          const map: Record<number, { completed: boolean; score: number; synced: boolean }> = {};
          localProgress.forEach((p) => {
            map[p.activityId] = {
              completed: p.completed,
              score: p.score,
              synced: p.synced
            };
          });
          setProgressMap(map);
        });
      }
    });

    return () => {
      unsubscribeSync();
    };
  }, [profile?.id]);

  const handleCompleteActivity = async (activity: Activity) => {
    if (!profile?.id) return;
    setCompletingId(activity.id);

    const score = activity.activityType === 'QUIZ' ? 85 : 100;
    const completedAt = new Date().toISOString();
    const progressId = `${profile.id}-${activity.id}`;

    // 1. Save locally in Dexie IndexedDB
    await offlineProgressRepository.saveProgress({
      id: progressId,
      studentId: profile.id,
      activityId: activity.id,
      score,
      completed: true,
      completedAt,
      synced: false
    });

    // Update local state map immediately
    setProgressMap((prev) => ({
      ...prev,
      [activity.id]: { completed: true, score, synced: false }
    }));

    // 2. Enqueue action into syncQueue
    await syncService.enqueueAction('COMPLETE_ACTIVITY', {
      studentId: profile.id,
      activityId: activity.id,
      score,
      completedAt
    });

    setCompletingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Network & Offline Status Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Learning Portal</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Offline-First Enabled • Classroom: {profile?.classroomName || 'Assigned'}</p>
        </div>
        <NetworkStatusBadge />
      </div>

      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <UserCheck className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{profile?.fullName}</h2>
            <p className="text-sky-100 text-sm mt-0.5">
              Class {profile?.classroomName} • EduQuest Demo School • Parent: {profile?.parentFullName}
            </p>
          </div>
        </div>
      </div>

      {/* Activity Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            Assigned Activities & Lessons ({activities.length})
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Works Online & Offline</span>
        </div>

        {activities.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 text-center rounded-2xl border border-gray-200 dark:border-gray-700">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">No published activities available yet.</p>
            <p className="text-xs text-gray-400 mt-1">Check back once your teacher publishes learning content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((act) => {
              const prog = progressMap[act.id];
              const isCompleted = prog?.completed;

              return (
                <div
                  key={act.id}
                  className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:border-sky-300 dark:hover:border-sky-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                        {act.subject}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        act.activityType === 'QUIZ' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {act.activityType}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">{act.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{act.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    {isCompleted ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Completed</span>
                          <span className="text-xs text-gray-400 ml-1.5">Score: {prog.score}%</span>
                          {!prog.synced && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">
                              Pending Sync
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Award className="w-4 h-4" />
                        <span>Not Started</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleCompleteActivity(act)}
                      disabled={completingId === act.id}
                      className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                        isCompleted
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200'
                          : 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-sm'
                      }`}
                    >
                      {isCompleted ? (
                        <span>Re-take</span>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Activity</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
