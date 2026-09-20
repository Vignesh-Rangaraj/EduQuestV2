import React, { useEffect, useState } from 'react';
import { parentService } from '../services/parentService';
import { moduleService } from '../services/moduleService';
import { Parent, StudentModuleProgress } from '../types';
import { Users, GraduationCap, Calendar, BookOpen, ShieldCheck, Trophy, Award, CheckCircle2 } from 'lucide-react';

export const ParentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Parent | null>(null);
  const [moduleProgress, setModuleProgress] = useState<StudentModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentData();
  }, []);

  const loadParentData = async () => {
    setLoading(true);
    try {
      const [pData, progressData] = await Promise.all([
        parentService.getProfile(),
        moduleService.getStudentModuleProgress().catch(() => [])
      ]);
      setProfile(pData);
      setModuleProgress(progressData);
    } catch (err) {
      console.error('Failed to load parent data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Parent Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Parent Portal: {profile?.fullName}</h1>
            <p className="text-amber-100 text-sm mt-0.5">
              EduQuest Demo School • Linked Children ({profile?.students?.length || 0})
            </p>
          </div>
        </div>
      </div>

      {/* Linked Children Profiles & Gamified Progress */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-amber-600" />
          Child Learning Progress & Achievements
        </h2>

        {(!profile?.students || profile.students.length === 0) ? (
          <div className="bg-white dark:bg-gray-800 p-8 text-center rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
            No children linked to this parent account yet. Please contact the administrator.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {profile.students.map((child) => (
              <div
                key={child.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6 hover:border-amber-400 transition-colors"
              >
                {/* Child Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-lg">
                      {child.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{child.fullName}</h3>
                      <p className="text-xs text-gray-500">Username: @{child.username} • Enrolled: Class {child.classroomName}</p>
                    </div>
                  </div>

                  {/* Level & XP Badges */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-xl text-xs font-bold shadow-sm">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>Level {child.level || 1}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-xl text-xs font-bold shadow-sm">
                      <Award className="w-4 h-4 text-purple-500" />
                      <span>{child.xp || 0} XP</span>
                    </div>
                  </div>
                </div>

                {/* Child Progress Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-750">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
                      <BookOpen className="w-4 h-4 text-sky-500" />
                      Assigned School
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">EduQuest Demo School</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-750">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Classroom Status
                    </div>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Class {child.classroomName} Active</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-750">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      Enrollment Date
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(child.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Learning Path Module Progress Cards */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Topic & Module Completion Progress
                  </h4>

                  {moduleProgress.length === 0 ? (
                    <div className="text-xs text-gray-400 italic bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl text-center">
                      Progress data syncing... Completed activities will be displayed here in real-time.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {moduleProgress.map((mp) => (
                        <div key={mp.id || mp.moduleId} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-750 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-white">
                            <span className="truncate">{mp.moduleTitle || `Module #${mp.moduleId}`}</span>
                            <span className="text-emerald-600 dark:text-emerald-400">{mp.completionPercentage}%</span>
                          </div>

                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${mp.completionPercentage}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                            <span>{mp.completedActivities} of {mp.totalActivities} activities done</span>
                            {mp.completed && (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                                Completed 🎉
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
