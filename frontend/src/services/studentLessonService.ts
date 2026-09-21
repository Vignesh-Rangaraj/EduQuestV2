import api from './api';
import { Activity, ContinueLearning } from '../types';

export const studentLessonService = {
  getLessonDetails: async (id: number): Promise<Activity> => {
    const res = await api.get<Activity>(`/student/lessons/${id}`);
    return res.data;
  },
  completeLesson: async (id: number): Promise<Activity> => {
    const res = await api.post<Activity>(`/student/lessons/${id}/complete`);
    return res.data;
  },
  getContinueLearning: async (): Promise<ContinueLearning> => {
    const res = await api.get<ContinueLearning>('/student/continue-learning');
    return res.data;
  }
};
