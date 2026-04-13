import { create } from 'zustand';

interface User {
  id: number;
  full_name: string;
  email: string;
  currency_symbol: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  unreadCount: number;
  showOnboarding: boolean;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  setUnreadCount: (count: number) => void;
  setOnboardingComplete: () => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  unreadCount: 0,
  isLoading: true,
  showOnboarding: false,

  login: (token, user) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    const hasOnboarded = localStorage.getItem(`onboarded_${user.id}`);
    set({ token, user, isLoading: false, showOnboarding: !hasOnboarded });
  },

  updateUser: (user) => {
    localStorage.setItem('userData', JSON.stringify(user));
    set({ user });
  },

  setUnreadCount: (unreadCount) => set({ unreadCount }),

  setOnboardingComplete: () => {
    const user = get().user;
    if (user) localStorage.setItem(`onboarded_${user.id}`, 'true');
    set({ showOnboarding: false });
  },

  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    set({ token: null, user: null, isLoading: false, showOnboarding: false });
  },

  loadFromStorage: () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        const user = JSON.parse(userData);
        const hasOnboarded = localStorage.getItem(`onboarded_${user.id}`);
        set({ token, user, isLoading: false, showOnboarding: !hasOnboarded });
      } else {
        set({ token: null, user: null, isLoading: false, showOnboarding: false });
      }
    } catch (error) {
      console.error('Failure loading auth state:', error);
      set({ token: null, user: null, isLoading: false, showOnboarding: false });
    }
  },
}));
