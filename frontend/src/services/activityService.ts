import api from './api';
import { Activity, CreateActivityPayload } from '../types';
import { networkService } from '../offline/networkService';
import { offlineActivityRepository } from '../offline/offlineActivityRepository';

export const activityService = {
  // Teacher Management API calls
  async getTeacherActivities(): Promise<Activity[]> {
    const response = await api.get<Activity[]>('/teacher/activities');
    return response.data;
  },

  async createActivity(payload: CreateActivityPayload): Promise<Activity> {
    const response = await api.post<Activity>('/teacher/activities', payload);
    return response.data;
  },

  async updateActivity(id: number, payload: CreateActivityPayload): Promise<Activity> {
    const response = await api.put<Activity>(`/teacher/activities/${id}`, payload);
    return response.data;
  },

  async publishActivity(id: number): Promise<Activity> {
    const response = await api.post<Activity>(`/teacher/activities/${id}/publish`);
    return response.data;
  },

  async archiveActivity(id: number): Promise<Activity> {
    const response = await api.post<Activity>(`/teacher/activities/${id}/archive`);
    return response.data;
  },

  // Student Fetch API with IndexedDB caching
  async getStudentActivities(): Promise<Activity[]> {
    if (networkService.isOnline()) {
      try {
        const response = await api.get<Activity[]>('/student/activities');
        const activities = response.data;

        // Cache in Dexie IndexedDB
        const localActivities = activities.map((act) => ({
          id: act.id,
          title: act.title,
          description: act.description,
          subject: act.subject,
          activityType: act.activityType,
          published: act.status === 'PUBLISHED',
          assignedClassroomId: act.assignedClassroomId,
          createdByTeacherId: act.createdByTeacherId
        }));
        await offlineActivityRepository.saveActivities(localActivities);

        return activities;
      } catch (error) {
        console.warn('API fetch failed, reading from Dexie offline database...');
        return this.getOfflineActivities();
      }
    } else {
      return this.getOfflineActivities();
    }
  },

  async getOfflineActivities(): Promise<Activity[]> {
    const local = await offlineActivityRepository.getPublishedActivities();
    return local.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      subject: item.subject as any,
      activityType: item.activityType as any,
      status: 'PUBLISHED',
      createdByTeacherId: item.createdByTeacherId,
      assignedClassroomId: item.assignedClassroomId
    }));
  }
};
