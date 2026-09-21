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
  xp: number;
  level: number;
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
export type ActivityType = 'LESSON' | 'QUIZ' | 'MATCH_THE_FOLLOWING' | 'SHOOT_THE_ANSWER' | 'BALLOON_POP' | 'TREASURE_HUNT';
export type ActivityStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SyncStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type UnlockType = 'PREREQUISITE_ACTIVITY' | 'MINIMUM_SCORE' | 'BADGE_REQUIRED';

export interface Module {
  id: number;
  title: string;
  description: string;
  subject: Subject;
  difficultyLevel: DifficultyLevel;
  estimatedMinutes?: number;
  classroomId?: number;
  status: ActivityStatus;
  createdByTeacherId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateModulePayload {
  title: string;
  description: string;
  subject: Subject;
  difficultyLevel: DifficultyLevel;
  estimatedMinutes?: number;
  classroomId?: number;
}

export interface CreateActivityPayload {
  title: string;
  description: String;
  subject: Subject;
  activityType: ActivityType;
  assignedClassroomId?: number;
  moduleId?: number;
  displayOrder?: number;
  xpReward?: number;
}

export interface Activity {
  id: number;
  moduleId?: number;
  title: string;
  description: string;
  subject: Subject;
  activityType: ActivityType;
  status: ActivityStatus;
  displayOrder?: number;
  prerequisiteActivityId?: number;
  unlockType?: UnlockType;
  unlockValue?: string;
  xpReward?: number;
  statusBadge?: 'COMPLETED' | 'CURRENT' | 'LOCKED' | 'NOT_STARTED';
  completed?: boolean;
  visibleToStudents?: boolean;
  aiGenerated?: boolean;
  aiGeneratedBy?: string;
  createdByTeacherId?: number;
  assignedClassroomId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonContent {
  id?: number;
  activityId: number;
  content: string;
  estimatedMinutes?: number;
}

export interface QuizQuestion {
  id?: number;
  activityId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  displayOrder?: number;
}

export interface SubmitQuizPayload {
  activityId: number;
  userAnswers: Record<number, string>;
}

export interface StudentQuizAttempt {
  id?: number;
  studentId: number;
  activityId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answersJson?: string;
  completedAt: string;
}

export interface GameConfiguration {
  id?: number;
  activityId: number;
  jsonConfiguration: string;
}

export interface StudentProgress {
  id?: number;
  studentId: number;
  activityId: number;
  activityTitle?: string;
  score: number;
  bestScore?: number;
  attemptCount?: number;
  completed: boolean;
  completedAt?: string;
}

export interface StudentModuleProgress {
  id?: number;
  studentId: number;
  moduleId: number;
  moduleTitle?: string;
  completedActivities: number;
  totalActivities: number;
  completionPercentage: number;
  completed: boolean;
  completedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: number;
  studentName: string;
  classroomName: string;
  xp: number;
  level: number;
}

export interface CurriculumOverview {
  totalSubjects: number;
  totalModules: number;
  totalActivities: number;
  publishedModules: number;
  publishedActivities: number;
  modules: Module[];
}

export interface Achievement {
  badgeCode: string;
  badgeName: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export interface SubjectProgress {
  subject: string;
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  progressPercentage: number;
}

export interface StudentOverviewProgress {
  studentId: number;
  studentName: string;
  totalXp: number;
  level: number;
  rank: number;
  streakDays: number;
  completedLessons: number;
  completedQuizzes: number;
  overallProgressPercentage: number;
  subjectProgresses: SubjectProgress[];
  recentActivities: StudentProgress[];
  achievements: Achievement[];
}

export interface StudentPerformanceSummary {
  studentId: number;
  studentName: string;
  totalXp: number;
  level: number;
  rank: number;
  completedLessons: number;
  completedQuizzes: number;
  completionPercentage: number;
  status: 'ACTIVE' | 'NEEDS_ATTENTION' | 'INACTIVE';
}

export interface TeacherAnalytics {
  classroomId: number | null;
  classroomName: string;
  totalStudents: number;
  averageXp: number;
  averageCompletionRate: number;
  activeStudentsCount: number;
  studentPerformanceList: StudentPerformanceSummary[];
  studentsNeedingAttention: StudentPerformanceSummary[];
  subjectAnalytics: SubjectProgress[];
}

export interface ClassroomSummary {
  id: number;
  name: string;
  grade: string;
  studentCount: number;
  averageXp: number;
}

export interface StudentLeaderboardSummary {
  id: number;
  name: string;
  classroomName: string;
  xp: number;
  level: number;
}

export interface TeacherSummary {
  id: number;
  name: string;
  classroomName: string;
  subject: string;
}

export interface AdminAnalytics {
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  totalModules: number;
  publishedModules: number;
  totalLessons: number;
  publishedLessons: number;
  totalQuizzes: number;
  activeRatePercentage: number;
  topClassrooms: ClassroomSummary[];
  topStudents: StudentLeaderboardSummary[];
  topTeachers: TeacherSummary[];
}

export interface ContinueLearning {
  moduleId: number | null;
  moduleName: string;
  lessonId: number | null;
  lessonTitle: string;
  progressPercentage: number;
  nextLessonId?: number | null;
}
