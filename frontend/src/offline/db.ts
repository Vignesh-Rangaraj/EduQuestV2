import Dexie, { Table } from 'dexie';

export interface LocalStudent {
  id?: number;
  userAccountId: number;
  fullName: string;
  username: string;
  grade?: number;
  section?: string;
  lastUpdated: string;
}

export interface LocalActivity {
  id: number;
  title: string;
  description: string;
  subject: string;
  activityType: string;
  published: boolean;
  assignedClassroomId?: number;
  createdByTeacherId?: number;
  lastSyncedAt?: string;
}

export interface LocalProgress {
  id: string; // "studentId-activityId"
  studentId: number;
  activityId: number;
  score: number;
  completed: boolean;
  completedAt: string;
  synced: boolean;
}

export interface LocalSyncQueueItem {
  id: string;
  actionType: string;
  payload: string; // JSON payload string
  createdAt: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
}

export interface LocalSetting {
  key: string;
  value: string;
}

export class EduQuestOfflineDB extends Dexie {
  students!: Table<LocalStudent, number>;
  activities!: Table<LocalActivity, number>;
  progress!: Table<LocalProgress, string>;
  syncQueue!: Table<LocalSyncQueueItem, string>;
  settings!: Table<LocalSetting, string>;

  constructor() {
    super('EduQuestOfflineDB');
    this.version(1).stores({
      students: '++id, userAccountId, username',
      activities: 'id, subject, activityType, published, assignedClassroomId',
      progress: 'id, studentId, activityId, synced',
      syncQueue: 'id, status, actionType, createdAt',
      settings: 'key'
    });
  }
}

export const db = new EduQuestOfflineDB();
