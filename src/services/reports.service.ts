import api from '@/lib/api';

export interface FinancialReport {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalExpected: number;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    dueDate: string;
    paidDate: string | null;
    method: string | null;
    tenant: string;
    property: string;
    unit: string;
  }>;
}

export interface PropertyReport {
  properties: Array<{
    id: string;
    name: string;
    address: string;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    occupancyRate: number;
    totalRent: number;
    collectedRent: number;
  }>;
  summary: {
    totalProperties: number;
    totalUnits: number;
    totalOccupied: number;
    totalVacant: number;
    overallOccupancy: number;
  };
}

export interface TenantReport {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  unit: string;
  rentAmount: number;
  leaseStart: string;
  leaseEnd: string;
  totalPaid: number;
  totalDue: number;
  paymentStatus: string;
}

export interface MaintenanceReport {
  total: number;
  byStatus: {
    PENDING: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
  requests: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    tenant: string;
    property: string;
    unit: string;
    reportedAt: string;
    resolvedAt: string | null;
  }>;
}

export interface VacancyReport {
  id: string;
  property: string;
  unitNumber: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  hasListing: boolean;
  listingViews: number;
  listingActive: boolean;
}

export interface OverviewReport {
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  totalRevenue: number;
  pendingMaintenance: number;
  vacantUnits: number;
  occupancyRate: number;
}

export const reportsService = {
  async getOverview(): Promise<OverviewReport> {
    const response = await api.get('/reports/overview');
    return response.data;
  },

  async getFinancial(startDate?: string, endDate?: string): Promise<FinancialReport> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/reports/financial?${params.toString()}`);
    return response.data;
  },

  async getProperty(): Promise<PropertyReport> {
    const response = await api.get('/reports/property');
    return response.data;
  },

  async getTenant(): Promise<TenantReport[]> {
    const response = await api.get('/reports/tenant');
    return response.data;
  },

  async getMaintenance(startDate?: string, endDate?: string): Promise<MaintenanceReport> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/reports/maintenance?${params.toString()}`);
    return response.data;
  },

  async getVacancy(): Promise<VacancyReport[]> {
    const response = await api.get('/reports/vacancy');
    return response.data;
  },
};
