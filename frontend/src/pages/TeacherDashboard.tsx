import React, { useEffect, useState } from 'react';
import { teacherService } from '../services/teacherService';
import { activityService } from '../services/activityService';
import { Teacher, Student, Activity, Subject, ActivityType, CreateActivityPayload } from '../types';
import { GraduationCap, Users, School, CheckCircle, Calendar, Plus, BookOpen, Send, Archive, Edit3, X } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<Subject>('MATHEMATICS');
  const [activityType, setActivityType] = useState<ActivityType>('LESSON');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      const [pData, sData, actData] = await Promise.all([
        teacherService.getProfile(),
        teacherService.getAssignedStudents(),
        activityService.getTeacherActivities()
      ]);
      setProfile(pData);
      setStudents(sData);
      setActivities(actData);
    } catch (err) {
      console.error('Failed to load teacher data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingActivityId(null);
    setTitle('');
    setDescription('');
    setSubject('MATHEMATICS');
    setActivityType('LESSON');
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (act: Activity) => {
    setEditingActivityId(act.id);
    setTitle(act.title);
    setDescription(act.description);
    setSubject(act.subject);
    setActivityType(act.activityType);
    setShowCreateModal(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const payload: CreateActivityPayload = {
        title,
        description,
        subject,
        activityType,
        assignedClassroomId: profile?.classroomId || undefined
      };

      if (editingActivityId) {
        await activityService.updateActivity(editingActivityId, payload);
      } else {
        await activityService.createActivity(payload);
      }

      setShowCreateModal(false);
      const updatedActs = await activityService.getTeacherActivities();
      setActivities(updatedActs);
    } catch (err) {
      console.error('Error saving activity', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await activityService.publishActivity(id);
      const updatedActs = await activityService.getTeacherActivities();
      setActivities(updatedActs);
    } catch (err) {
      console.error('Error publishing activity', err);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await activityService.archiveActivity(id);
      const updatedActs = await activityService.getTeacherActivities();
      setActivities(updatedActs);
    } catch (err) {
      console.error('Error archiving activity', err);
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

      {/* Classroom Stats Cards */}
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
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">My Activities</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activities.length} Created</p>
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

      {/* Activity Management Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            My Activity Management
          </h2>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Activity</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No activities created yet. Click "Create Activity" to author content.
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                      <div>{act.title}</div>
                      <div className="text-xs text-gray-400 font-normal line-clamp-1">{act.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                        {act.subject}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                        {act.activityType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        act.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : act.status === 'ARCHIVED'
                          ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(act)}
                          className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-gray-700 rounded-lg"
                          title="Edit Activity"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {act.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handlePublish(act.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg"
                            title="Publish Activity"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {act.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchive(act.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                            title="Archive Activity"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

      {/* Create / Edit Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingActivityId ? 'Edit Activity' : 'Create New Activity'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fractions Basics"
                  className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Activity overview and learning goals..."
                  className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as Subject)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="MATHEMATICS">MATHEMATICS</option>
                    <option value="SCIENCE">SCIENCE</option>
                    <option value="ENGLISH">ENGLISH</option>
                    <option value="SOCIAL_SCIENCE">SOCIAL_SCIENCE</option>
                    <option value="TAMIL">TAMIL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as ActivityType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="LESSON">LESSON</option>
                    <option value="QUIZ">QUIZ</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
                >
                  {submitting ? 'Saving...' : editingActivityId ? 'Update Activity' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
