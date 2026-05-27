import api from "@/lib/api";

export interface TenantLeaseInfo {
  id: string;
  unit: {
    id: string;
    unitNumber: string;
    property: {
      id: string;
      name: string;
      address: string;
    };
  };
}

export interface Tenant {
  id: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    createdAt?: string;
  };
  nationalId?: string;
  emergencyContact?: string;
  occupation?: string;
  leases?: TenantLeaseInfo[];
}

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
  async createTenant(data: CreateTenantDto): Promise<Tenant> {
    const response = await api.post("/tenants", data);
    return response.data;
  },

  async getAllTenants(): Promise<Tenant[]> {
    const response = await api.get("/tenants");
    return response.data;
  },

  async getTenantById(id: string): Promise<Tenant> {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },

  async updateTenant(id: string, data: UpdateTenantDto): Promise<Tenant> {
    const response = await api.patch(`/tenants/${id}`, data);
    return response.data;
  },

  async deleteTenant(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/tenants/${id}`);
    return response.data;
  },
};
