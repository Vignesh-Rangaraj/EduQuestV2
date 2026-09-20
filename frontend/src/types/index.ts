export type Role = 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface Classroom {
  id: number;
  grade: number;
  section: string;
  name: string;
  schoolName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  classroomId: number | null;
  classroomName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  classroomId: number | null;
  classroomName: string;
  parentId: number | null;
  parentFullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Parent {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  students: Student[];
  createdAt: string;
  updatedAt: string;
}

export type Subject = 'MATHEMATICS' | 'SCIENCE' | 'ENGLISH' | 'SOCIAL_SCIENCE' | 'TAMIL';
export type ActivityType = 'LESSON' | 'QUIZ';
export type ActivityStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SyncStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Activity {
  id: number;
  title: string;
  description: string;
  subject: Subject;
  activityType: ActivityType;
  status: ActivityStatus;
  createdByTeacherId?: number;
  assignedClassroomId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProgress {
  id?: number;
  studentId: number;
  activityId: number;
  activityTitle?: string;
  score: number;
  completed: boolean;
  completedAt?: string;
}

export interface CreateActivityPayload {
  title: string;
  description: string;
  subject: Subject;
  activityType: ActivityType;
  assignedClassroomId?: number;
}
