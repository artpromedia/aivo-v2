import { create } from 'zustand';
import type { OfflineData, OfflineAction } from '../types';

interface OfflineState {
  isOnline: boolean;
  offlineData: OfflineData | null;
  pendingActions: OfflineAction[];
  lastSync: Date | null;
  syncing: boolean;

  setOnlineStatus: (isOnline: boolean) => void;
  addPendingAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>) => void;
  markActionSynced: (actionId: string) => void;
  updateOfflineData: (data: Partial<OfflineData>) => void;
  clearOfflineData: () => void;
  setSyncing: (syncing: boolean) => void;
  setLastSync: (date: Date) => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOnline: navigator.onLine,
  offlineData: null,
  pendingActions: [],
  lastSync: null,
  syncing: false,

  setOnlineStatus: (isOnline) => set({ isOnline }),

  addPendingAction: (action) => {
    const newAction: OfflineAction = {
      ...action,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      synced: false
    };
    
    const { pendingActions } = get();
    set({ pendingActions: [...pendingActions, newAction] });
  },

  markActionSynced: (actionId) => {
    const { pendingActions } = get();
    const updatedActions = pendingActions.map(action => 
      action.id === actionId ? { ...action, synced: true } : action
    );
    set({ pendingActions: updatedActions });
  },

  updateOfflineData: (data) => {
    const { offlineData } = get();
    const updated = offlineData ? { ...offlineData, ...data } : data as OfflineData;
    set({ offlineData: updated });
  },

  clearOfflineData: () => set({ offlineData: null }),

  setSyncing: (syncing) => set({ syncing }),

  setLastSync: (date) => set({ lastSync: date })
}));

// Listen for online/offline events
window.addEventListener('online', () => {
  useOfflineStore.getState().setOnlineStatus(true);
});

window.addEventListener('offline', () => {
  useOfflineStore.getState().setOnlineStatus(false);
});