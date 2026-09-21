import api from './api';
import { Teacher, Student, TeacherAnalytics } from '../types';

export const teacherService = {
  getProfile: async (): Promise<Teacher> => {
    const res = await api.get<Teacher>('/teacher/profile');
    return res.data;
  },
  getAssignedStudents: async (): Promise<Student[]> => {
    const res = await api.get<Student[]>('/teacher/students');
    return res.data;
  },
  getAnalytics: async (): Promise<TeacherAnalytics> => {
    const res = await api.get<TeacherAnalytics>('/teacher/analytics');
    return res.data;
  }
};
