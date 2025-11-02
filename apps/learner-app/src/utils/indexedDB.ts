import { openDB, IDBPDatabase } from 'idb';
import { OfflineData, Lesson, Progress, User, OfflineAction } from '../types';

const DB_NAME = 'AivoLearnerDB';
const DB_VERSION = 1;

interface AivoLearnerDB {
  lessons: {
    key: string;
    value: Lesson;
  };
  progress: {
    key: string;
    value: Progress;
  };
  users: {
    key: string;
    value: User;
  };
  offlineActions: {
    key: string;
    value: OfflineAction;
  };
  appData: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<AivoLearnerDB>>;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<AivoLearnerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Lessons store
        if (!db.objectStoreNames.contains('lessons')) {
          const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' });
          lessonStore.createIndex('subject', 'subject');
          lessonStore.createIndex('gradeLevel', 'gradeLevel');
        }

        // Progress store
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
          progressStore.createIndex('lessonId', 'lessonId');
          progressStore.createIndex('userId', 'userId');
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }

        // Offline actions store
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionsStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
          actionsStore.createIndex('synced', 'synced');
          actionsStore.createIndex('timestamp', 'timestamp');
        }

        // App data store (for misc data like last sync, settings, etc.)
        if (!db.objectStoreNames.contains('appData')) {
          db.createObjectStore('appData');
        }
      },
    });
  }
  return dbPromise;
};

// Lesson operations
export const saveLessons = async (lessons: Lesson[]): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction('lessons', 'readwrite');
  
  await Promise.all(lessons.map(lesson => tx.store.put(lesson)));
  await tx.done;
};

export const getLessons = async (): Promise<Lesson[]> => {
  const db = await initDB();
  return await db.getAll('lessons');
};

export const getLesson = async (id: string): Promise<Lesson | undefined> => {
  const db = await initDB();
  return await db.get('lessons', id);
};

export const getLessonsByGrade = async (gradeLevel: number): Promise<Lesson[]> => {
  const db = await initDB();
  return await db.getAllFromIndex('lessons', 'gradeLevel', gradeLevel);
};

export const getLessonsBySubject = async (subject: string): Promise<Lesson[]> => {
  const db = await initDB();
  return await db.getAllFromIndex('lessons', 'subject', subject);
};

// Progress operations
export const saveProgress = async (progress: Progress): Promise<void> => {
  const db = await initDB();
  const progressWithId = { ...progress, id: `${progress.userId}-${progress.lessonId}` };
  await db.put('progress', progressWithId);
};

export const getProgress = async (userId: string, lessonId: string): Promise<Progress | undefined> => {
  const db = await initDB();
  return await db.get('progress', `${userId}-${lessonId}`);
};

export const getUserProgress = async (userId: string): Promise<Progress[]> => {
  const db = await initDB();
  return await db.getAllFromIndex('progress', 'userId', userId);
};

export const getLessonProgress = async (lessonId: string): Promise<Progress[]> => {
  const db = await initDB();
  return await db.getAllFromIndex('progress', 'lessonId', lessonId);
};

// User operations
export const saveUser = async (user: User): Promise<void> => {
  const db = await initDB();
  await db.put('users', user);
};

export const getUser = async (id: string): Promise<User | undefined> => {
  const db = await initDB();
  return await db.get('users', id);
};

export const getCurrentUser = async (): Promise<User | null> => {
  const db = await initDB();
  const currentUserId = await db.get('appData', 'currentUserId');
  if (!currentUserId) return null;
  
  const user = await db.get('users', currentUserId);
  return user || null;
};

export const setCurrentUser = async (userId: string): Promise<void> => {
  const db = await initDB();
  await db.put('appData', userId, 'currentUserId');
};

// Offline actions operations
export const saveOfflineAction = async (action: OfflineAction): Promise<void> => {
  const db = await initDB();
  await db.put('offlineActions', action);
};

export const getPendingActions = async (): Promise<OfflineAction[]> => {
  const db = await initDB();
  const allActions = await db.getAllFromIndex('offlineActions', 'synced');
  return allActions.filter(action => action.synced === false);
};

export const markActionSynced = async (actionId: string): Promise<void> => {
  const db = await initDB();
  const action = await db.get('offlineActions', actionId);
  if (action) {
    await db.put('offlineActions', { ...action, synced: true });
  }
};

export const clearSyncedActions = async (): Promise<void> => {
  const db = await initDB();
  const allActions = await db.getAllFromIndex('offlineActions', 'synced');
  const syncedActions = allActions.filter(action => action.synced === true);
  const tx = db.transaction('offlineActions', 'readwrite');
  
  await Promise.all(syncedActions.map((action: any) => tx.store.delete(action.id)));
  await tx.done;
};

// App data operations
export const setLastSync = async (timestamp: Date): Promise<void> => {
  const db = await initDB();
  await db.put('appData', timestamp.toISOString(), 'lastSync');
};

export const getLastSync = async (): Promise<Date | null> => {
  const db = await initDB();
  const timestamp = await db.get('appData', 'lastSync');
  return timestamp ? new Date(timestamp) : null;
};

// Bulk operations for sync
export const saveOfflineData = async (data: OfflineData): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(['lessons', 'progress', 'users', 'appData'], 'readwrite');
  
  // Save lessons
  await Promise.all(data.lessons.map((lesson: Lesson) => tx.objectStore('lessons').put(lesson)));
  
  // Store progress
  await Promise.all(data.progress.map((progress: Progress) => {
    const progressWithId = { ...progress, id: `${progress.userId}-${progress.lessonId}` };
    return tx.objectStore('progress').put(progressWithId);
  }));
  
  // Save user
  await tx.objectStore('users').put(data.user);
  await tx.objectStore('appData').put(data.user.id, 'currentUserId');
  
  // Save last sync
  await tx.objectStore('appData').put(data.lastSync.toISOString(), 'lastSync');
  
  await tx.done;
};

export const getOfflineData = async (): Promise<OfflineData | null> => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;
  
  const [lessons, userProgress, lastSync] = await Promise.all([
    getLessons(),
    getUserProgress(currentUser.id),
    getLastSync()
  ]);
  
  return {
    lessons,
    progress: userProgress,
    user: currentUser,
    lastSync: lastSync || new Date(),
    pendingActions: await getPendingActions()
  };
};

// Clear all data (for logout)
export const clearOfflineData = async (): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(['lessons', 'progress', 'users', 'offlineActions', 'appData'], 'readwrite');
  
  await Promise.all([
    tx.objectStore('lessons').clear(),
    tx.objectStore('progress').clear(),
    tx.objectStore('users').clear(),
    tx.objectStore('offlineActions').clear(),
    tx.objectStore('appData').clear()
  ]);
  
  await tx.done;
};

// Database size management
export const getDatabaseSize = async (): Promise<number> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
  return 0;
};

export const cleanupOldData = async (daysToKeep: number = 30): Promise<void> => {
  const db = await initDB();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  // Clean up old synced actions
  const oldActions = await db.transaction('offlineActions', 'readonly')
    .objectStore('offlineActions')
    .index('timestamp')
    .getAll(IDBKeyRange.upperBound(cutoffDate));
    
  const syncedOldActions = oldActions.filter(action => action.synced);
  
  if (syncedOldActions.length > 0) {
    const tx = db.transaction('offlineActions', 'readwrite');
    await Promise.all(syncedOldActions.map(action => tx.store.delete(action.id)));
    await tx.done;
  }
};