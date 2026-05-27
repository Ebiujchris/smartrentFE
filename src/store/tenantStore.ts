import { create } from "zustand";
import axios from "axios";
import {
  tenantService,
  CreateTenantDto,
  UpdateTenantDto,
  Tenant,
} from "@/services/tenant.service";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;

    if (typeof apiMessage === "string") {
      return apiMessage;
    }

    if (Array.isArray(apiMessage)) {
      return apiMessage.join(", ");
    }
  }

  return fallback;
}

interface TenantStore {
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  fetchTenants: () => Promise<void>;
  createTenant: (data: CreateTenantDto) => Promise<Tenant>;
  updateTenant: (id: string, data: UpdateTenantDto) => Promise<Tenant>;
  deleteTenant: (id: string) => Promise<void>;
}

export const useTenantStore = create<TenantStore>((set) => ({
  tenants: [],
  loading: false,
  error: null,

  fetchTenants: async () => {
    set({ loading: true, error: null });
    try {
      const tenants = await tenantService.getAllTenants();
      set({ tenants, loading: false });
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to fetch tenants"),
        loading: false,
      });
    }
  },

  createTenant: async (data: CreateTenantDto) => {
    set({ loading: true, error: null });
    try {
      const tenant = await tenantService.createTenant(data);
      set((state) => ({ tenants: [...state.tenants, tenant], loading: false }));
      return tenant;
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to create tenant"),
        loading: false,
      });
      throw error;
    }
  },

  updateTenant: async (id: string, data: UpdateTenantDto) => {
    set({ loading: true, error: null });
    try {
      const updated = await tenantService.updateTenant(id, data);
      set((state) => ({
        tenants: state.tenants.map((t) => (t.id === id ? updated : t)),
        loading: false,
      }));
      return updated;
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to update tenant"),
        loading: false,
      });
      throw error;
    }
  },

  deleteTenant: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await tenantService.deleteTenant(id);
      set((state) => ({
        tenants: state.tenants.filter((t) => t.id !== id),
        loading: false,
      }));
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, "Failed to delete tenant"),
        loading: false,
      });
      throw error;
    }
  },
}));
