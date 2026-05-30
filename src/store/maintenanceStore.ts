import { create } from "zustand";
import {
  maintenanceService,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
} from "@/services/maintenance.service";

interface MaintenanceStore {
  requests: any[];
  loading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  createRequest: (data: CreateMaintenanceDto) => Promise<any>;
  updateRequest: (id: string, data: UpdateMaintenanceDto) => Promise<any>;
  updateStatus: (id: string, status: string, notes?: string) => Promise<any>;
  deleteRequest: (id: string) => Promise<void>;
  reset: () => void; // Add reset method for security
}

export const useMaintenanceStore = create<MaintenanceStore>((set) => ({
  requests: [],
  loading: false,
  error: null,

  fetchRequests: async () => {
    set({ loading: true, error: null });
    try {
      const requests = await maintenanceService.getAllRequests();
      set({ requests, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createRequest: async (data: CreateMaintenanceDto) => {
    set({ loading: true, error: null });
    try {
      const request = await maintenanceService.createRequest(data);
      set((state) => ({
        requests: [...state.requests, request],
        loading: false,
      }));
      return request;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateRequest: async (id: string, data: UpdateMaintenanceDto) => {
    set({ loading: true, error: null });
    try {
      const updated = await maintenanceService.updateRequest(id, data);
      set((state) => ({
        requests: state.requests.map((r) => (r.id === id ? updated : r)),
        loading: false,
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateStatus: async (id: string, status: string, notes?: string) => {
    set({ loading: true, error: null });
    try {
      const updated = await maintenanceService.updateStatus(id, status, notes);
      set((state) => ({
        requests: state.requests.map((r) => (r.id === id ? updated : r)),
        loading: false,
      }));
      return updated;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteRequest: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await maintenanceService.deleteRequest(id);
      set((state) => ({
        requests: state.requests.filter((r) => r.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // SECURITY: Reset method to clear all data on logout
  reset: () => {
    console.log("[MaintenanceStore] Resetting all maintenance data");
    set({
      requests: [],
      loading: false,
      error: null,
    });
  },
}));
