import api from "@/lib/api";

export type UnitStatus = "VACANT" | "OCCUPIED" | "MAINTENANCE" | "RESERVED";

export interface TenantUser {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface Tenant {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  occupation?: string;
  user?: TenantUser;
}

export type PaymentStatus =
  | "PAID"
  | "PENDING"
  | "OVERDUE"
  | "FAILED"
  | "PARTIAL";

export interface Payment {
  id: string;
  amount: number | string;
  dueDate: string;
  status: PaymentStatus;
}

export interface Lease {
  id: string;
  isActive?: boolean;
  startDate: string;
  endDate: string;
  rentAmount: number | string;
  deposit: number | string;
  tenant?: Tenant;
  payments?: Payment[];
}

export interface Unit {
  id: string;
  unitNumber: string;
  rentAmount: number | string;
  floor?: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: string;
  status: UnitStatus;
  tenant?: Tenant;
  activeLease?: Lease | null;
  leases?: Lease[];
}

export interface Property {
  id: string;
  name: string;
  address: string;
  description?: string;
  createdAt: string;
  units?: Unit[];
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
  status?: "VACANT" | "OCCUPIED" | "MAINTENANCE" | "RESERVED";
}

export const propertyService = {
  async getAll(): Promise<Property[]> {
    const response = await api.get("/properties");
    return response.data;
  },

  async getOne(id: string): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },

  async create(data: CreatePropertyData): Promise<Property> {
    const response = await api.post("/properties", data);
    return response.data;
  },

  async update(
    id: string,
    data: Partial<CreatePropertyData>,
  ): Promise<Property> {
    const response = await api.patch(`/properties/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },

  async getUnits(propertyId: string): Promise<Unit[]> {
    const response = await api.get(`/properties/${propertyId}/units`);
    return response.data;
  },

  async createUnit(propertyId: string, data: CreateUnitData): Promise<Unit> {
    const response = await api.post(`/properties/${propertyId}/units`, data);
    return response.data;
  },
};
