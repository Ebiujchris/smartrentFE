import api from '@/lib/api';

export interface CreateLeaseDto {
  tenantId: string;
  unitId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  deposit: number;
}

export interface UpdateLeaseDto {
  startDate?: string;
  endDate?: string;
  rentAmount?: number;
  deposit?: number;
  isActive?: boolean;
}

export const leaseService = {
  async createLease(data: CreateLeaseDto) {
    const response = await api.post('/leases', data);
    return response.data;
  },

  async getAllLeases() {
    const response = await api.get('/leases');
    return response.data;
  },

  async getLeaseById(id: string) {
    const response = await api.get(`/leases/${id}`);
    return response.data;
  },

  async updateLease(id: string, data: UpdateLeaseDto) {
    const response = await api.patch(`/leases/${id}`, data);
    return response.data;
  },

  async terminateLease(id: string) {
    const response = await api.post(`/leases/${id}/terminate`);
    return response.data;
  },

  async deleteLease(id: string) {
    const response = await api.delete(`/leases/${id}`);
    return response.data;
  },
};
