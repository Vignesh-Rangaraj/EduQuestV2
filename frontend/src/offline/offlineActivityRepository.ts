import { db, LocalActivity } from './db';

export const offlineActivityRepository = {
  async saveActivities(activities: LocalActivity[]): Promise<void> {
    const now = new Date().toISOString();
    const items = activities.map((act) => ({ ...act, lastSyncedAt: now }));
    await db.activities.bulkPut(items);
  },

  async getPublishedActivities(): Promise<LocalActivity[]> {
    return await db.activities.where('published').equals(1).toArray();
  },

  async getAllActivities(): Promise<LocalActivity[]> {
    return await db.activities.toArray();
  },

  async getActivityById(id: number): Promise<LocalActivity | undefined> {
    return await db.activities.get(id);
  }
};
