import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { ThemeToggle } from '../components/ThemeToggle';
import { BookOpen, Key, UserCheck, AlertCircle, Shield, GraduationCap, User, Users } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await authService.login(username, password);
      login(data.token, {
        id: data.userId,
        username: data.username,
        fullName: data.fullName,
        role: data.role,
      });

      if (data.role === 'SUPER_ADMIN') navigate('/admin');
      else if (data.role === 'TEACHER') navigate('/teacher');
      else if (data.role === 'STUDENT') navigate('/student');
      else if (data.role === 'PARENT') navigate('/parent');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/30 mb-4">
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">EduQuest V2</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Offline-First Gamified Learning Platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 text-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Key className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Phase 1 Quick Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => fillQuickAccount('admin', 'admin123')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-left font-medium transition-colors"
              >
                <Shield className="w-4 h-4 text-purple-500" />
                Super Admin
              </button>
              <button
                onClick={() => fillQuickAccount('teacher_6a', 'password123')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-left font-medium transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                Teacher (6-A)
              </button>
              <button
                onClick={() => fillQuickAccount('student_6a_1', 'password123')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-left font-medium transition-colors"
              >
                <User className="w-4 h-4 text-sky-500" />
                Student (6-A)
              </button>
              <button
                onClick={() => fillQuickAccount('parent_6a_1', 'password123')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-left font-medium transition-colors"
              >
                <Users className="w-4 h-4 text-amber-500" />
                Parent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
