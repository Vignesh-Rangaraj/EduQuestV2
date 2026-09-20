import React, { useEffect, useState } from 'react';
import { parentService } from '../services/parentService';
import { Parent } from '../types';
import { Users, GraduationCap, Calendar, BookOpen, ShieldCheck } from 'lucide-react';

export const ParentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentService.getProfile()
      .then(setProfile)
      .catch((err) => console.error('Failed to load parent profile', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Parent Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <Users className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Parent Portal: {profile?.fullName}</h1>
            <p className="text-amber-100 text-sm mt-0.5">EduQuest Demo School • Linked Children ({profile?.students?.length || 0})</p>
          </div>
        </div>
      </div>

      {/* Linked Children Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-amber-600" />
          Linked Children Profiles
        </h2>

        {(!profile?.students || profile.students.length === 0) ? (
          <div className="bg-white dark:bg-gray-800 p-8 text-center rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
            No children linked to this parent account yet. Please contact the administrator.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.students.map((child) => (
              <div
                key={child.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{child.fullName}</h3>
                    <p className="text-xs text-gray-500">Username: @{child.username}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-full">
                    Class {child.classroomName}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-500" />
                    <span>School: <strong>EduQuest Demo School</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Status: <strong>Active Student</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
                    <Calendar className="w-4 h-4" />
                    <span>Enrolled: {new Date(child.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
