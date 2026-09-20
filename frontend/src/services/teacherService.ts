import api from './api';
import { Teacher, Student } from '../types';

export const teacherService = {
  getProfile: async (): Promise<Teacher> => {
    const res = await api.get<Teacher>('/teacher/profile');
    return res.data;
  },
  getAssignedStudents: async (): Promise<Student[]> => {
    const res = await api.get<Student[]>('/teacher/students');
    return res.data;
  }
};
