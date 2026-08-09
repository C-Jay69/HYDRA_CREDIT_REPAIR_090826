'use client';
import { create } from 'zustand';

export type Page = 'dashboard' | 'upload' | 'disputes' | 'deadlines' | 'vault' | 'calculator' | 'simulator' | 'knowledge' | 'settings';

interface AppState {
  currentPage: Page;
  sidebarOpen: boolean;
  disclaimerAccepted: boolean;
  userId: string;
  userName: string;
  userState: string;
  userCountry: 'US' | 'CA';
  setCurrentPage: (page: Page) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  acceptDisclaimer: () => void;
  setUserId: (id: string) => void;
  setUserInfo: (name: string, state: string, country: 'US' | 'CA') => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  sidebarOpen: true,
  disclaimerAccepted: false,
  userId: '',
  userName: '',
  userState: '',
  userCountry: 'US',
  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  acceptDisclaimer: () => set({ disclaimerAccepted: true }),
  setUserId: (id) => set({ userId: id }),
  setUserInfo: (name, state, country) => set({ userName: name, userState: state, userCountry: country }),
}));
