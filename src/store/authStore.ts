import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService, RegisterData, LoginData } from '@/services/auth.service';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  subscription?: any;
  tenantProfile?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(data);
          // Save to localStorage immediately
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
          }
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          // Save to localStorage immediately
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
          }
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
        }
        set({ user: null, token: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);
