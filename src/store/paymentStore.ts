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
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  payments: [],
  loading: false,
  error: null,

  fetchPayments: async () => {
    set({ loading: true, error: null });
    try {
      const payments = await paymentService.getAllPayments();
      set({ payments, loading: false });
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
}));
