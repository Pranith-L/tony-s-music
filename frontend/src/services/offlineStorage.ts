import { Track } from '../types/index.js';

const DB_NAME = 'TonyPrakashOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_tracks';

export interface OfflineTrackRecord {
  id: string;
  track: Track;
  blob: Blob;
  mimeType: string;
  size: number;
  downloadedAt: number;
}

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private activeObjectUrls: Map<string, string> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported in this browser.'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Downloads track audio stream into in-app IndexedDB storage (never exposed as OS file download).
   */
  async saveTrackOffline(
    track: Track,
    onProgress?: (progressPercent: number) => void
  ): Promise<void> {
    const db = await this.getDB();
    const url = track.audioUrl;

    if (!url) {
      throw new Error('Track has no valid audio URL.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    const contentLengthHeader = response.headers.get('content-length');
    const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
    let loadedBytes = 0;

    let blob: Blob;

    if (response.body && totalBytes > 0 && typeof ReadableStream !== 'undefined') {
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loadedBytes += value.length;
          if (onProgress && totalBytes > 0) {
            const pct = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
            onProgress(pct);
          }
        }
      }

      const mimeType = response.headers.get('content-type') || 'audio/mpeg';
      blob = new Blob(chunks, { type: mimeType });
    } else {
      blob = await response.blob();
      if (onProgress) onProgress(100);
    }

    const record: OfflineTrackRecord = {
      id: track.id,
      track,
      blob,
      mimeType: blob.type || 'audio/mpeg',
      size: blob.size,
      downloadedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putRequest = store.put(record);

      putRequest.onsuccess = () => {
        // Notify any listeners across tabs or components
        window.dispatchEvent(
          new CustomEvent('tony_offline_change', { detail: { trackId: track.id, action: 'added' } })
        );
        resolve();
      };
      putRequest.onerror = () => reject(putRequest.error);
    });
  }

  /**
   * Check if track is saved in offline storage.
   */
  async isTrackOffline(trackId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const countRequest = store.count(trackId);

        countRequest.onsuccess = () => resolve(countRequest.result > 0);
        countRequest.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /**
   * Get all offline track IDs.
   */
  async getOfflineTrackIds(): Promise<string[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();

        request.onsuccess = () => {
          resolve((request.result as string[]) || []);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  /**
   * Get an in-memory Object URL for instantaneous offline playback.
   */
  async getOfflineAudioUrl(trackId: string): Promise<string | null> {
    try {
      // Return cached object url if already created
      if (this.activeObjectUrls.has(trackId)) {
        return this.activeObjectUrls.get(trackId)!;
      }

      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(trackId);

        request.onsuccess = () => {
          const record = request.result as OfflineTrackRecord | undefined;
          if (record && record.blob) {
            const objectUrl = URL.createObjectURL(record.blob);
            this.activeObjectUrls.set(trackId, objectUrl);
            resolve(objectUrl);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Delete track from offline storage.
   */
  async deleteTrackOffline(trackId: string): Promise<void> {
    const db = await this.getDB();

    if (this.activeObjectUrls.has(trackId)) {
      URL.revokeObjectURL(this.activeObjectUrls.get(trackId)!);
      this.activeObjectUrls.delete(trackId);
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const deleteRequest = store.delete(trackId);

      deleteRequest.onsuccess = () => {
        window.dispatchEvent(
          new CustomEvent('tony_offline_change', { detail: { trackId, action: 'removed' } })
        );
        resolve();
      };
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  /**
   * Get list of all offline tracks with metadata.
   */
  async getAllOfflineTracks(): Promise<{ track: Track; size: number; downloadedAt: number }[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const records = (request.result as OfflineTrackRecord[]) || [];
          resolve(
            records.map((r) => ({
              track: r.track,
              size: r.size,
              downloadedAt: r.downloadedAt,
            }))
          );
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  /**
   * Get storage statistics (number of downloaded songs and total MB).
   */
  async getStorageStats(): Promise<{ count: number; totalBytes: number; totalMB: string }> {
    const tracks = await this.getAllOfflineTracks();
    const totalBytes = tracks.reduce((sum, t) => sum + (t.size || 0), 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
    return {
      count: tracks.length,
      totalBytes,
      totalMB,
    };
  }

  /**
   * Clear all offline songs.
   */
  async clearAllOffline(): Promise<void> {
    const db = await this.getDB();
    for (const url of this.activeObjectUrls.values()) {
      URL.revokeObjectURL(url);
    }
    this.activeObjectUrls.clear();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        window.dispatchEvent(
          new CustomEvent('tony_offline_change', { detail: { action: 'cleared' } })
        );
        resolve();
      };
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }
}

export const offlineStorage = new OfflineStorageService();

