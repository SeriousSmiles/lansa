import { create } from 'zustand';

interface UIState {
  // Bottom Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // FAB and Quick Actions
  isQuickActionsOpen: boolean;
  setQuickActionsOpen: (open: boolean) => void;
  
  // Search
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  
  // Bottom Sheets
  openSheets: Set<string>;
  openSheet: (id: string) => void;
  closeSheet: (id: string) => void;
  
  // Navigation
  canGoBack: boolean;
  setCanGoBack: (canGoBack: boolean) => void;
  
  // App state
  isOnline: boolean;
  setOnline: (online: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  isQuickActionsOpen: false,
  setQuickActionsOpen: (open) => set({ isQuickActionsOpen: open }),
  
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  
  openSheets: new Set(),
  openSheet: (id) => set((state) => ({ 
    openSheets: new Set([...state.openSheets, id]) 
  })),
  closeSheet: (id) => set((state) => {
    const newSheets = new Set(state.openSheets);
    newSheets.delete(id);
    return { openSheets: newSheets };
  }),
  
  canGoBack: false,
  setCanGoBack: (canGoBack) => set({ canGoBack }),
  
  isOnline: navigator.onLine,
  setOnline: (online) => set({ isOnline: online }),
}));