import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService, RegisterData, LoginData } from "@/services/auth.service";

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
          console.log("[AuthStore] ===== LOGIN INITIATED =====");

          // SECURITY: Clear all existing data before login
          console.log("[AuthStore] Clearing existing data before new login");
          try {
            const { usePaymentStore } = require("./paymentStore");
            usePaymentStore.getState().reset();

            const { useTenantStore } = require("./tenantStore");
            useTenantStore.getState().reset();

            const { usePropertyStore } = require("./propertyStore");
            usePropertyStore.getState().reset();

            const { useSubscriptionStore } = require("./subscriptionStore");
            useSubscriptionStore.getState().reset();

            const { useMaintenanceStore } = require("./maintenanceStore");
            useMaintenanceStore.getState().reset();
          } catch (error) {
            console.error("[AuthStore] Error clearing stores on login:", error);
          }

          const response = await authService.login(data);
          console.log(
            `[AuthStore] Login successful for user: ${response.user.email} (${response.user.role})`,
          );

          // Save to localStorage immediately
          if (typeof window !== "undefined") {
            localStorage.setItem("token", response.token);
          }

          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });

          console.log("[AuthStore] ===== LOGIN COMPLETE =====");
        } catch (error: any) {
          console.error("[AuthStore] Login failed:", error);
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          console.log("[AuthStore] ===== REGISTRATION INITIATED =====");

          // SECURITY: Clear all existing data before registration
          console.log("[AuthStore] Clearing existing data before registration");
          try {
            const { usePaymentStore } = require("./paymentStore");
            usePaymentStore.getState().reset();

            const { useTenantStore } = require("./tenantStore");
            useTenantStore.getState().reset();

            const { usePropertyStore } = require("./propertyStore");
            usePropertyStore.getState().reset();

            const { useSubscriptionStore } = require("./subscriptionStore");
            useSubscriptionStore.getState().reset();

            const { useMaintenanceStore } = require("./maintenanceStore");
            useMaintenanceStore.getState().reset();
          } catch (error) {
            console.error(
              "[AuthStore] Error clearing stores on registration:",
              error,
            );
          }

          const response = await authService.register(data);
          console.log(
            `[AuthStore] Registration successful for user: ${response.user.email} (${response.user.role})`,
          );

          // Save to localStorage immediately
          if (typeof window !== "undefined") {
            localStorage.setItem("token", response.token);
          }

          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });

          console.log("[AuthStore] ===== REGISTRATION COMPLETE =====");
        } catch (error: any) {
          console.error("[AuthStore] Registration failed:", error);
          set({
            error: error.response?.data?.message || "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        console.log("[AuthStore] ===== LOGOUT INITIATED =====");
        console.log("[AuthStore] Clearing all stores and storage");

        // SECURITY FIX: Reset all stores to prevent data leakage
        // Import and reset each store synchronously
        try {
          // Reset payment store
          const { usePaymentStore } = require("./paymentStore");
          usePaymentStore.getState().reset();

          // Reset tenant store
          const { useTenantStore } = require("./tenantStore");
          useTenantStore.getState().reset();

          // Reset property store
          const { usePropertyStore } = require("./propertyStore");
          usePropertyStore.getState().reset();

          // Reset subscription store
          const { useSubscriptionStore } = require("./subscriptionStore");
          useSubscriptionStore.getState().reset();

          // Reset maintenance store
          const { useMaintenanceStore } = require("./maintenanceStore");
          useMaintenanceStore.getState().reset();

          console.log("[AuthStore] All stores reset successfully");
        } catch (error) {
          console.error("[AuthStore] Error resetting stores:", error);
        }

        if (typeof window !== "undefined") {
          // Clear ALL storage to prevent data leakage
          console.log("[AuthStore] Clearing localStorage and sessionStorage");
          localStorage.removeItem("token");
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("payment-storage");
          localStorage.removeItem("tenant-storage");
          localStorage.removeItem("property-storage");
          localStorage.removeItem("subscription-storage");
          localStorage.removeItem("maintenance-storage");

          // Also clear sessionStorage
          sessionStorage.clear();

          console.log("[AuthStore] Storage cleared");
        }

        set({ user: null, token: null });
        console.log("[AuthStore] ===== LOGOUT COMPLETE =====");
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
