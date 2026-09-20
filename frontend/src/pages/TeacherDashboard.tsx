import React, { useEffect, useState } from 'react';
import { teacherService } from '../services/teacherService';
import { Teacher, Student } from '../types';
import { GraduationCap, Users, School, CheckCircle, Calendar } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const [pData, sData] = await Promise.all([
        teacherService.getProfile(),
        teacherService.getAssignedStudents(),
      ]);
      setProfile(pData);
      setStudents(sData);
    } catch (err) {
      console.error('Failed to load teacher data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Teacher Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome, {profile?.fullName}!</h1>
              <p className="text-emerald-100 text-sm mt-0.5">EduQuest Demo School • Teacher Portal</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
            <p className="text-xs text-emerald-100">Assigned Classroom</p>
            <p className="text-lg font-bold">Class {profile?.classroomName || 'Unassigned'}</p>
          </div>
        </div>
      </div>

      {/* Classroom Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Enrolled Students</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length} Students</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <School className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Classroom Name</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Class {profile?.classroomName}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Active & Syncing</p>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Classroom Student Roster ({profile?.classroomName})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Parent / Guardian</th>
                <th className="py-3 px-4">Audit Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No students currently assigned to your classroom.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-500">#{s.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">{s.fullName}</td>
                    <td className="py-3.5 px-4 text-gray-500">{s.username}</td>
                    <td className="py-3.5 px-4 font-medium text-emerald-600 dark:text-emerald-400">
                      {s.parentFullName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
