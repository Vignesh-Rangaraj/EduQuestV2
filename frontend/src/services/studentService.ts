import api from './api';
import { Student, StudentOverviewProgress, Achievement } from '../types';

export const studentService = {
  getProfile: async (): Promise<Student> => {
    const res = await api.get<Student>('/student/profile');
    return res.data;
  },
  getProgressOverview: async (): Promise<StudentOverviewProgress> => {
    const res = await api.get<StudentOverviewProgress>('/student/progress/overview');
    return res.data;
  },
  getAchievements: async (): Promise<Achievement[]> => {
    const res = await api.get<Achievement[]>('/student/achievements');
    return res.data;
  }
};
