import api from './api';
import { Student } from '../types';

export const studentService = {
  getProfile: async (): Promise<Student> => {
    const res = await api.get<Student>('/student/profile');
    return res.data;
  }
};
