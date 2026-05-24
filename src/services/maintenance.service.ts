import api from '@/lib/api';

export interface CreateMaintenanceDto {
  unitId: string;
  tenantId: string;
  title: string;
  description: string;
  priority?: string;
}

export interface UpdateMaintenanceDto {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  notes?: string;
}

export const maintenanceService = {
  async createRequest(data: CreateMaintenanceDto) {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  async getAllRequests() {
    const response = await api.get('/maintenance');
    return response.data;
  },

  async getRequestById(id: string) {
    const response = await api.get(`/maintenance/${id}`);
    return response.data;
  },

  async updateRequest(id: string, data: UpdateMaintenanceDto) {
    const response = await api.patch(`/maintenance/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: string, notes?: string) {
    const response = await api.post(`/maintenance/${id}/status`, { status, notes });
    return response.data;
  },

  async deleteRequest(id: string) {
    const response = await api.delete(`/maintenance/${id}`);
    return response.data;
  },
};
