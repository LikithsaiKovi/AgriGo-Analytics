// Offline Service for Smart Farming Analytics
// Handles data caching, offline storage, and sync when connection is restored

interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
  syncStatus: 'pending' | 'synced' | 'failed';
}

class OfflineService {
  private dbName = 'SmartFarmingOffline';
  private version = 1;
  private db: IDBDatabase | null = null;
  private isOnline = navigator.onLine;
  private syncQueue: OfflineData[] = [];

  constructor() {
    this.init();
    this.setupEventListeners();
  }

  private async init() {
    try {
      this.db = await this.openDatabase();
      await this.loadSyncQueue();
    } catch (error) {
      console.error('Failed to initialize offline service:', error);
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for different data types
        if (!db.objectStoreNames.contains('weather')) {
          db.createObjectStore('weather', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('market')) {
          db.createObjectStore('market', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('crop')) {
          db.createObjectStore('crop', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('community')) {
          db.createObjectStore('community', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'key' });
        }
      };
    });
  }

  private setupEventListeners() {
    // Online/Offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Service Worker registration for caching
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }

  // Cache data for offline access
  async cacheData(storeName: string, data: any, key?: string): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const item = {
        id: key || Date.now().toString(),
        data,
        timestamp: Date.now(),
        syncStatus: 'synced' as const
      };
      
      await store.put(item);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  // Get cached data
  async getCachedData(storeName: string, key?: string): Promise<any> {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      if (key) {
        const request = store.get(key);
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result?.data || null);
          request.onerror = () => reject(request.error);
        });
      } else {
        // Get all data
        const request = store.getAll();
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  // Queue data for sync when online
  async queueForSync(storeName: string, data: any, key?: string): Promise<void> {
    if (!this.db) return;

    const offlineData: OfflineData = {
      key: key || Date.now().toString(),
      data,
      timestamp: Date.now(),
      syncStatus: 'pending'
    };

    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      await store.put({ ...offlineData, storeName });
      
      this.syncQueue.push(offlineData);
    } catch (error) {
      console.error('Failed to queue data for sync:', error);
    }
  }

  // Load sync queue from IndexedDB
  private async loadSyncQueue(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();
      
      request.onsuccess = () => {
        this.syncQueue = request.result || [];
      };
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  // Sync pending data when online
  private async syncPendingData(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    console.log('Syncing pending data...');
    
    for (const item of this.syncQueue) {
      try {
        // Attempt to sync with server
        await this.syncWithServer(item);
        
        // Mark as synced
        item.syncStatus = 'synced';
        await this.updateSyncStatus(item.key, 'synced');
      } catch (error) {
        console.error('Failed to sync item:', error);
        item.syncStatus = 'failed';
        await this.updateSyncStatus(item.key, 'failed');
      }
    }

    // Remove synced items from queue
    this.syncQueue = this.syncQueue.filter(item => item.syncStatus !== 'synced');
  }

  // Sync individual item with server
  private async syncWithServer(item: OfflineData): Promise<void> {
    // This would contain actual API calls to sync with server
    // For now, we'll simulate the sync
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Synced item:', item.key);
        resolve();
      }, 1000);
    });
  }

  // Update sync status in IndexedDB
  private async updateSyncStatus(key: string, status: 'pending' | 'synced' | 'failed'): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.syncStatus = status;
          store.put(item);
        }
      };
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  }

  // Get offline status
  isOffline(): boolean {
    return !this.isOnline;
  }

  // Get sync queue status
  getSyncStatus(): { pending: number; failed: number; synced: number } {
    const pending = this.syncQueue.filter(item => item.syncStatus === 'pending').length;
    const failed = this.syncQueue.filter(item => item.syncStatus === 'failed').length;
    const synced = this.syncQueue.filter(item => item.syncStatus === 'synced').length;
    
    return { pending, failed, synced };
  }

  // Clear old cached data
  async clearOldCache(daysOld: number = 7): Promise<void> {
    if (!this.db) return;

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const stores = ['weather', 'market', 'crop', 'community'];

    for (const storeName of stores) {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const items = request.result;
          items.forEach(item => {
            if (item.timestamp < cutoffTime) {
              store.delete(item.id);
            }
          });
        };
      } catch (error) {
        console.error(`Failed to clear old cache for ${storeName}:`, error);
      }
    }
  }
}

// Create singleton instance
export const offlineService = new OfflineService();

// Export for use in components
export default offlineService;

