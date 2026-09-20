import { db, LocalProgress } from './db';

export const offlineProgressRepository = {
  async saveProgress(progress: LocalProgress): Promise<void> {
    await db.progress.put(progress);
  },

  async getStudentProgress(studentId: number): Promise<LocalProgress[]> {
    return await db.progress.where('studentId').equals(studentId).toArray();
  },

  async getUnsyncedProgress(): Promise<LocalProgress[]> {
    return await db.progress.where('synced').equals(0).toArray();
  },

  async markProgressSynced(id: string): Promise<void> {
    await db.progress.update(id, { synced: true });
  }
};
