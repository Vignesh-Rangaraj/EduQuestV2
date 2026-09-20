import { db, LocalStudent } from './db';

export const offlineStudentRepository = {
  async saveStudentProfile(student: LocalStudent): Promise<void> {
    const existing = await db.students.where('username').equals(student.username).first();
    if (existing) {
      await db.students.update(existing.id!, { ...student, lastUpdated: new Date().toISOString() });
    } else {
      await db.students.add({ ...student, lastUpdated: new Date().toISOString() });
    }
  },

  async getStudentProfileByUsername(username: string): Promise<LocalStudent | undefined> {
    return await db.students.where('username').equals(username).first();
  }
};
