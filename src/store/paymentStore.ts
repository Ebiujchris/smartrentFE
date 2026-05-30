import { create } from "zustand";
import {
  paymentService,
  CreatePaymentDto,
  UpdatePaymentDto,
} from "@/services/payment.service";

interface PaymentStore {
  payments: any[];
  loading: boolean;
  error: string | null;
  currentUserId: string | null; // Track which user's data this is
  fetchPayments: () => Promise<void>;
  createPayment: (data: CreatePaymentDto) => Promise<any>;
  updatePayment: (id: string, data: UpdatePaymentDto) => Promise<any>;
  recordPayment: (
    id: string,
    method: string,
    reference?: string,
    notes?: string,
  ) => Promise<any>;
  deletePayment: (id: string) => Promise<void>;
  reset: () => void; // Add reset method for security
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  loading: false,
  error: null,
  currentUserId: null,

  fetchPayments: async () => {
    set({ loading: true, error: null });
    try {
      // Import authStore to validate current user
      const { useAuthStore } = await import("./authStore");
      const currentUser = useAuthStore.getState().user;

      if (!currentUser) {
        console.warn("[PaymentStore] No authenticated user, clearing payments");
        set({
          payments: [],
          loading: false,
          error: "Not authenticated",
          currentUserId: null,
        });
        return;
      }

      // Check if we need to clear old data for different user
      const storedUserId = get().currentUserId;
      if (storedUserId && storedUserId !== currentUser.id) {
        console.warn(
          `[PaymentStore] User changed from ${storedUserId} to ${currentUser.id}, clearing old data`,
        );
        set({ payments: [] });
      }

      const payments = await paymentService.getAllPayments();
      set({ payments, loading: false, currentUserId: currentUser.id });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createPayment: async (data: CreatePaymentDto) => {
    set({ loading: true, error: null });
    try {
      const payment = await paymentService.createPayment(data);
      set((state) => ({
        payments: [...state.payments, payment],
        loading: false,
      }));
      return payment;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updatePayment: async (id: string, data: UpdatePaymentDto) => {
    set({ loading: true, error: null });
    try {
      const updated = await paymentService.updatePayment(id, data);
      set((state) => ({
        payments: state.payments.map((p) => (p.id === id ? updated : p)),
        loading: false,
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  recordPayment: async (
    id: string,
    method: string,
    reference?: string,
    notes?: string,
  ) => {
    set({ loading: true, error: null });
    try {
      const updated = await paymentService.recordPayment(
        id,
        method,
        reference,
        notes,
      );
      set((state) => ({
        payments: state.payments.map((p) => (p.id === id ? updated : p)),
        loading: false,
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deletePayment: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await paymentService.deletePayment(id);
      set((state) => ({
        payments: state.payments.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // SECURITY: Reset method to clear all data on logout
  reset: () => {
    console.log("[PaymentStore] Resetting all payment data");
    set({
      payments: [],
      loading: false,
      error: null,
      currentUserId: null,
    });
  },
}));
