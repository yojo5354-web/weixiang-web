import { create } from 'zustand';

interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  bio?: string;
  gender?: number;
  location?: string;
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
}

interface AppState {
  // 用户
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  
  // UI 状态
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 用户状态
  user: typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || 'null') 
    : null,
  token: typeof window !== 'undefined' 
    ? localStorage.getItem('token') 
    : null,
  isLoggedIn: typeof window !== 'undefined' 
    ? !!localStorage.getItem('token') 
    : false,
  
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    }
    set({ user, isLoggedIn: !!user });
  },
  
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    set({ token, isLoggedIn: !!token });
  },
  
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
    set({ user, token, isLoggedIn: true });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    set({ user: null, token: null, isLoggedIn: false });
  },
  
  // UI 状态
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
