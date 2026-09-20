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
