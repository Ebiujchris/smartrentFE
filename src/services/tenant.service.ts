import api from '@/lib/api';

export interface CreateTenantDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  nationalId?: string;
  emergencyContact?: string;
  occupation?: string;
}

export interface UpdateTenantDto {
  fullName?: string;
  phone?: string;
  nationalId?: string;
  emergencyContact?: string;
  occupation?: string;
}

export const tenantService = {
  async createTenant(data: CreateTenantDto) {
    const response = await api.post('/tenants', data);
    return response.data;
  },

  async getAllTenants() {
    const response = await api.get('/tenants');
    return response.data;
  },

  async getTenantById(id: string) {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },

  async updateTenant(id: string, data: UpdateTenantDto) {
    const response = await api.patch(`/tenants/${id}`, data);
    return response.data;
  },

  async deleteTenant(id: string) {
    const response = await api.delete(`/tenants/${id}`);
    return response.data;
  },
};
