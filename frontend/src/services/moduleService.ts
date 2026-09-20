import api from './api';
import {
  Module,
  CreateModulePayload,
  Activity,
  LessonContent,
  QuizQuestion,
  GameConfiguration,
  StudentModuleProgress
} from '../types';

export const moduleService = {
  // Teacher APIs
  async getTeacherModules(): Promise<Module[]> {
    const response = await api.get<Module[]>('/teacher/modules');
    return response.data;
  },

  async createModule(payload: CreateModulePayload): Promise<Module> {
    const response = await api.post<Module>('/teacher/modules', payload);
    return response.data;
  },

  async updateModule(id: number, payload: CreateModulePayload): Promise<Module> {
    const response = await api.put<Module>(`/teacher/modules/${id}`, payload);
    return response.data;
  },

  async publishModule(id: number): Promise<Module> {
    const response = await api.post<Module>(`/teacher/modules/${id}/publish`);
    return response.data;
  },

  async archiveModule(id: number): Promise<Module> {
    const response = await api.post<Module>(`/teacher/modules/${id}/archive`);
    return response.data;
  },

  async saveLessonContent(activityId: number, content: string, estimatedMinutes?: number): Promise<LessonContent> {
    const response = await api.post<LessonContent>(`/teacher/modules/${activityId}/lesson`, {
      activityId,
      content,
      estimatedMinutes
    });
    return response.data;
  },

  async saveQuizQuestion(activityId: number, question: Partial<QuizQuestion>): Promise<QuizQuestion> {
    const response = await api.post<QuizQuestion>(`/teacher/modules/${activityId}/quiz-question`, {
      activityId,
      ...question
    });
    return response.data;
  },

  async saveGameConfig(activityId: number, jsonConfiguration: string): Promise<GameConfiguration> {
    const response = await api.post<GameConfiguration>(`/teacher/modules/${activityId}/game-config`, {
      activityId,
      jsonConfiguration
    });
    return response.data;
  },

  // Student APIs
  async getStudentModules(): Promise<Module[]> {
    const response = await api.get<Module[]>('/student/modules');
    return response.data;
  },

  async getModuleActivities(moduleId: number): Promise<Activity[]> {
    const response = await api.get<Activity[]>(`/student/modules/${moduleId}/activities`);
    return response.data;
  },

  async getLessonContent(activityId: number): Promise<LessonContent> {
    const response = await api.get<LessonContent>(`/student/activities/${activityId}/lesson`);
    return response.data;
  },

  async getQuizQuestions(activityId: number): Promise<QuizQuestion[]> {
    const response = await api.get<QuizQuestion[]>(`/student/activities/${activityId}/quiz-questions`);
    return response.data;
  },

  async getGameConfig(activityId: number): Promise<GameConfiguration> {
    const response = await api.get<GameConfiguration>(`/student/activities/${activityId}/game-config`);
    return response.data;
  },

  async getStudentModuleProgress(): Promise<StudentModuleProgress[]> {
    const response = await api.get<StudentModuleProgress[]>('/student/module-progress');
    return response.data;
  }
};
