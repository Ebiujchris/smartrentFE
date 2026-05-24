import { create } from 'zustand';
import { tenantService, CreateTenantDto, UpdateTenantDto } from '@/services/tenant.service';

interface TenantStore {
  tenants: any[];
  loading: boolean;
  error: string | null;
  fetchTenants: () => Promise<void>;
  createTenant: (data: CreateTenantDto) => Promise<any>;
  updateTenant: (id: string, data: UpdateTenantDto) => Promise<any>;
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
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createTenant: async (data: CreateTenantDto) => {
    set({ loading: true, error: null });
    try {
      const tenant = await tenantService.createTenant(data);
      set((state) => ({ tenants: [...state.tenants, tenant], loading: false }));
      return tenant;
    } catch (error: any) {
      set({ error: error.message, loading: false });
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
    } catch (error: any) {
      set({ error: error.message, loading: false });
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
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
