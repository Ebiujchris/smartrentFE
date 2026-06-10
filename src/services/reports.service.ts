import api from '@/lib/api';

export interface FinancialReport {
  totalCollected: number;
  paidCount: number;
  pendingCount: number;
  lateCount: number;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    paymentDate: string;
    tenant: string;
    property: string;
    unit: string;
  }>;
  monthlyData: Array<{
    month: string;
    amount: number;
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
  tenants: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    property: string;
    unit: string;
    leaseStart: string;
    leaseEnd: string;
    totalPayments: number;
    paidPayments: number;
    latePayments: number;
    totalPaid: number;
  }>;
  summary: {
    totalTenants: number;
    activeTenants: number;
    inactiveTenants: number;
  };
}

export interface MaintenanceReport {
  requests: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    tenant: string;
    property: string;
    unit: string;
    createdAt: string;
    resolvedAt: string | null;
  }>;
  summary: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    avgResolutionDays: number;
  };
}

export interface VacancyReport {
  listings: Array<{
    id: string;
    title: string;
    property: string;
    unit: string;
    rent: number;
    views: number;
    postedDate: string;
    status: string;
  }>;
  summary: {
    totalListings: number;
    activeListings: number;
    inactiveListings: number;
    totalViews: number;
    avgViews: number;
  };
}

export interface OverviewReport {
  subscription: {
    plan: string;
    expiryDate: string;
    daysRemaining: number;
  };
  stats: {
    properties: number;
    units: number;
    tenants: number;
    totalRevenue: number;
    pendingPayments: number;
    maintenanceRequests: number;
    vacantListings: number;
  };
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

  async getTenant(): Promise<TenantReport> {
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

  async getVacancy(): Promise<VacancyReport> {
    const response = await api.get('/reports/vacancy');
    return response.data;
  },
};
