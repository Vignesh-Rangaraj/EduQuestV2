import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, GraduationCap, UserCheck, Users } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <nav className="space-y-1">
        {user.role === 'SUPER_ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-semibold border-l-4 border-sky-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`
            }
          >
            <ShieldCheck className="w-5 h-5" />
            Super Admin Control
          </NavLink>
        )}

        {user.role === 'TEACHER' && (
          <NavLink
            to="/teacher"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-semibold border-l-4 border-sky-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`
            }
          >
            <GraduationCap className="w-5 h-5" />
            Classroom Overview
          </NavLink>
        )}

        {user.role === 'STUDENT' && (
          <NavLink
            to="/student"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-semibold border-l-4 border-sky-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`
            }
          >
            <UserCheck className="w-5 h-5" />
            Student Profile
          </NavLink>
        )}

        {user.role === 'PARENT' && (
          <NavLink
            to="/parent"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 font-semibold border-l-4 border-sky-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`
            }
          >
            <Users className="w-5 h-5" />
            Parent Dashboard
          </NavLink>
        )}
      </nav>

      <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900/50">
        <p className="text-xs font-semibold text-sky-900 dark:text-sky-200">EduQuest Demo School</p>
        <p className="text-[11px] text-sky-700 dark:text-sky-400 mt-0.5">Offline-First Engine v2.0</p>
      </div>
    </aside>
  );
};
