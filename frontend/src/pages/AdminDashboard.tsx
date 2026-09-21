import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { curriculumService } from '../services/curriculumService';
import { gamificationService } from '../services/gamificationService';
import { Teacher, Student, Parent, Classroom, CurriculumOverview, AdminAnalytics } from '../types';
import {
  UserPlus,
  Link,
  Users,
  GraduationCap,
  School as SchoolIcon,
  Shield,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Layers,
  Award,
  BarChart3,
  TrendingUp,
  Zap,
  CheckCircle,
  Trophy
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumOverview | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [challengeAdminStats, setChallengeAdminStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [roleToCreate, setRoleToCreate] = useState<'TEACHER' | 'STUDENT' | 'PARENT'>('TEACHER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | ''>('');
  const [selectedParentId, setSelectedParentId] = useState<number | ''>('');

  // Assignment states
  const [assignTeacherId, setAssignTeacherId] = useState<number | ''>('');
  const [assignTeacherClassroomId, setAssignTeacherClassroomId] = useState<number | ''>('');

  const [assignStudentId, setAssignStudentId] = useState<number | ''>('');
  const [assignStudentParentId, setAssignStudentParentId] = useState<number | ''>('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [tData, sData, pData, cData, currData, analyticsData, cStats] = await Promise.all([
        adminService.getAllTeachers(),
        adminService.getAllStudents(),
        adminService.getAllParents(),
        adminService.getAllClassrooms(),
        curriculumService.getCurriculumOverview().catch(() => null),
        adminService.getAnalytics().catch(() => null),
        gamificationService.getAdminChallengeStats().catch(() => null)
      ]);
      setTeachers(tData);
      setStudents(sData);
      setParents(pData);
      setClassrooms(cData);
      setCurriculum(currData);
      setAnalytics(analyticsData);
      setChallengeAdminStats(cStats);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      if (roleToCreate === 'TEACHER') {
        await adminService.createTeacher({
          username,
          password,
          fullName,
          classroomId: selectedClassroomId ? Number(selectedClassroomId) : undefined,
        });
        setMessage({ type: 'success', text: `Teacher "${fullName}" created successfully!` });
      } else if (roleToCreate === 'STUDENT') {
        await adminService.createStudent({
          username,
          password,
          fullName,
          classroomId: selectedClassroomId ? Number(selectedClassroomId) : undefined,
          parentId: selectedParentId ? Number(selectedParentId) : undefined,
        });
        setMessage({ type: 'success', text: `Student "${fullName}" created successfully!` });
      } else if (roleToCreate === 'PARENT') {
        await adminService.createParent({ username, password, fullName });
        setMessage({ type: 'success', text: `Parent "${fullName}" created successfully!` });
      }

      setUsername('');
      setPassword('');
      setFullName('');
      setSelectedClassroomId('');
      setSelectedParentId('');
      loadAllData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create user' });
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTeacherId || !assignTeacherClassroomId) return;
    try {
      await adminService.assignTeacherToClassroom(Number(assignTeacherId), Number(assignTeacherClassroomId));
      setMessage({ type: 'success', text: 'Teacher successfully assigned to classroom!' });
      loadAllData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to assign teacher' });
    }
  };

  const handleAssignParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignStudentId || !assignStudentParentId) return;
    try {
      await adminService.assignParentToStudent(Number(assignStudentId), Number(assignStudentParentId));
      setMessage({ type: 'success', text: 'Parent successfully assigned to student!' });
      loadAllData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to assign parent' });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 to-indigo-800 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h1>
            <p className="text-sky-100 text-sm mt-0.5">EduQuest Demo School • System Management Console</p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* School Overview & Analytics Summary */}
      {analytics && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            School Analytics Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Schools</p>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{analytics.totalSchools || 1}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Teachers</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.totalTeachers}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Students</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.totalStudents}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Modules</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{analytics.totalModules || 0} ({analytics.publishedModules || 0} Pub)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Lessons</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.totalLessons || 0} ({analytics.publishedLessons || 0} Pub)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Quizzes</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analytics.totalQuizzes}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase">Active Rate</p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{analytics.activeRatePercentage}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Platform Analytics Summary */}
      {challengeAdminStats && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/40 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Platform Gamification & Challenge Analytics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50/50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/40">
              <p className="text-xs font-semibold text-gray-500 uppercase">Total Platform Challenges</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{challengeAdminStats.totalPlatformChallenges ?? 0}</p>
            </div>
            <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-xs font-semibold text-gray-500 uppercase">Challenge Completion Rate</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{challengeAdminStats.challengeCompletionRate ?? 0}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3.5 rounded-xl border border-gray-200 dark:border-gray-600">
              <p className="text-xs font-semibold text-gray-500 uppercase">Archived Challenges</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{challengeAdminStats.archivedChallenges ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Create User & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create User Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Create New Account
          </h2>

          <div className="flex gap-2 mb-6">
            {(['TEACHER', 'STUDENT', 'PARENT'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleToCreate(r)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                  roleToCreate === r
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. teacher_ramesh"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            {(roleToCreate === 'TEACHER' || roleToCreate === 'STUDENT') && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Assign Classroom</label>
                <select
                  value={selectedClassroomId}
                  onChange={(e) => setSelectedClassroomId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">Select Classroom (Optional)</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      Class {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {roleToCreate === 'STUDENT' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Assign Parent</label>
                <select
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">Select Parent (Optional)</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.username})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              Create {roleToCreate.replace('_', ' ')} Account
            </button>
          </form>
        </div>

        {/* Assignments Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Link className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Assign Teacher to Class
            </h2>
            <form onSubmit={handleAssignTeacher} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value ? Number(e.target.value) : '')}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.classroomName})
                    </option>
                  ))}
                </select>

                <select
                  value={assignTeacherClassroomId}
                  onChange={(e) => setAssignTeacherClassroomId(e.target.value ? Number(e.target.value) : '')}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Classroom</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      Class {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
              >
                Link Teacher to Class
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Assign Parent to Student
            </h2>
            <form onSubmit={handleAssignParent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(e.target.value ? Number(e.target.value) : '')}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.classroomName})
                    </option>
                  ))}
                </select>

                <select
                  value={assignStudentParentId}
                  onChange={(e) => setAssignStudentParentId(e.target.value ? Number(e.target.value) : '')}
                  className="px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select Parent</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm"
              >
                Link Parent to Student
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tables Overview */}
      <div className="space-y-6">
        {/* Classrooms & Teachers Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <SchoolIcon className="w-5 h-5 text-sky-600" />
            Classrooms ({classrooms.length}) & Teachers ({teachers.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Classroom</th>
                  <th className="py-3 px-4">Grade & Section</th>
                  <th className="py-3 px-4">Assigned Teacher</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
                {classrooms.map((c) => {
                  const assignedTeacher = teachers.find((t) => t.classroomId === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Class {c.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">Grade {c.grade}, Section {c.section}</td>
                      <td className="py-3 px-4 font-medium text-sky-600 dark:text-sky-400">
                        {assignedTeacher ? assignedTeacher.fullName : 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students List Table */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            Enrolled Students ({students.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Classroom</th>
                  <th className="py-3 px-4">Level & XP</th>
                  <th className="py-3 px-4">Linked Parent</th>
                  <th className="py-3 px-4">Audit Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{s.fullName}</td>
                    <td className="py-3 px-4 text-gray-500">{s.username}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 text-xs font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 rounded-full">
                        {s.classroomName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400 text-xs">
                      Lvl {s.level || 1} • {s.xp || 0} XP
                    </td>
                    <td className="py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400">{s.parentFullName}</td>
                    <td className="py-3 px-4 text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
