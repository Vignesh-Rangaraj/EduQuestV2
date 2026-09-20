import { db, LocalSyncQueueItem } from './db';
import { networkService } from './networkService';
import { syncApiService } from '../services/syncApiService';
import { offlineProgressRepository } from './offlineProgressRepository';

type SyncEventListener = () => void;

class SyncService {
  private isProcessing: boolean = false;
  private listeners: Set<SyncEventListener> = new Set();

  constructor() {
    // Listen for network changes
    networkService.subscribe((isOnline) => {
      if (isOnline) {
        this.processQueue();
      }
    });
  }

  public subscribe(listener: SyncEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  public async enqueueAction(actionType: string, payload: any): Promise<string> {
    const queueId = `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newItem: LocalSyncQueueItem = {
      id: queueId,
      actionType,
      payload: JSON.stringify(payload),
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      retryCount: 0
    };

    await db.syncQueue.add(newItem);
    this.notifyListeners();

    if (networkService.isOnline()) {
      this.processQueue();
    }

    return queueId;
  }

  public async getPendingCount(): Promise<number> {
    return await db.syncQueue.where('status').equals('PENDING').or('status').equals('FAILED').count();
  }

  public async getLastSyncTime(): Promise<string | null> {
    const setting = await db.settings.get('last_sync_time');
    return setting ? setting.value : null;
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing || networkService.isOffline()) {
      return;
    }

    this.isProcessing = true;
    try {
      const pendingItems = await db.syncQueue
        .where('status')
        .equals('PENDING')
        .or('status')
        .equals('FAILED')
        .toArray();

      if (pendingItems.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Transition items to PROCESSING
      for (const item of pendingItems) {
        await db.syncQueue.update(item.id, { status: 'PROCESSING' });
      }
      this.notifyListeners();

      // Format payload for backend batch sync endpoint
      const syncItemsPayload = pendingItems.map((item) => {
        let parsedPayload: any = {};
        try {
          parsedPayload = JSON.parse(item.payload);
        } catch (e) {
          parsedPayload = {};
        }

        return {
          id: item.id,
          actionType: item.actionType,
          studentId: parsedPayload.studentId,
          activityId: parsedPayload.activityId,
          score: parsedPayload.score,
          completedAt: parsedPayload.completedAt,
          payload: item.payload
        };
      });

      const response = await syncApiService.sendSyncRequest({
        studentId: syncItemsPayload[0]?.studentId,
        items: syncItemsPayload
      });

      if (response && response.success) {
        // Mark items completed and remove completed items
        for (const item of pendingItems) {
          await db.syncQueue.update(item.id, { status: 'COMPLETED' });
          await db.syncQueue.delete(item.id);

          // Update local progress record synced status
          try {
            const parsed = JSON.parse(item.payload);
            if (parsed.studentId && parsed.activityId) {
              const progressId = `${parsed.studentId}-${parsed.activityId}`;
              await offlineProgressRepository.markProgressSynced(progressId);
            }
          } catch (err) {
            // continue
          }
        }

        await db.settings.put({ key: 'last_sync_time', value: new Date().toISOString() });
      } else {
        // Mark failed items
        for (const item of pendingItems) {
          await db.syncQueue.update(item.id, {
            status: 'FAILED',
            retryCount: (item.retryCount || 0) + 1
          });
        }
      }
    } catch (error) {
      console.error('Error during auto-sync:', error);
      const pendingItems = await db.syncQueue.where('status').equals('PROCESSING').toArray();
      for (const item of pendingItems) {
        await db.syncQueue.update(item.id, {
          status: 'FAILED',
          retryCount: (item.retryCount || 0) + 1
        });
      }
    } finally {
      this.isProcessing = false;
      this.notifyListeners();
    }
  }
}

export const syncService = new SyncService();
