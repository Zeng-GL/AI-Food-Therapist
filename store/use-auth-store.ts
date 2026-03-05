import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  
  // Mock login for development
  mockLogin: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      
      login: (user) => set({ isLoggedIn: true, user }),
      
      logout: () => {
        // Clear auth state
        set({ isLoggedIn: false, user: null });
        
        // Clear onboarding data
        localStorage.removeItem('onboarding-data');
      },
      
      mockLogin: () => {
        const mockUser: User = {
          id: 'mock-user-' + Date.now(),
          email: 'mock.user@example.com',
          fullName: 'Mock User',
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
        };
        
        set({ isLoggedIn: true, user: mockUser });
      },
    }),
    {
      name: 'auth-mock',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
