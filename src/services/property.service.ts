import api from '@/lib/api';

export interface Property {
  id: string;
  name: string;
  address: string;
  description?: string;
  createdAt: string;
  units?: any[];
}

export interface CreatePropertyData {
  name: string;
  address: string;
  description?: string;
}

export interface CreateUnitData {
  unitNumber: string;
  rentAmount: number;
  floor?: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: string;
  status?: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
}

export const propertyService = {
  async getAll(): Promise<Property[]> {
    const response = await api.get('/properties');
    return response.data;
  },

  async getOne(id: string): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  async create(data: CreatePropertyData): Promise<Property> {
    const response = await api.post('/properties', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreatePropertyData>): Promise<Property> {
    const response = await api.patch(`/properties/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },

  async getUnits(propertyId: string) {
    const response = await api.get(`/properties/${propertyId}/units`);
    return response.data;
  },

  async createUnit(propertyId: string, data: CreateUnitData) {
    const response = await api.post(`/properties/${propertyId}/units`, data);
    return response.data;
  },
};
