import api from "@/lib/api";

export interface CreatePaymentDto {
  leaseId: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  method?: string;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  dueDate?: string;
  paidDate?: string;
  status?: string;
  method?: string;
  reference?: string;
  notes?: string;
}

export interface RecordRentReceiptDto {
  leaseId: string;
  amount: number;
  method: string;
  type?: "RENT" | "DEPOSIT";
  paidAt?: string;
  reference?: string;
  notes?: string;
}

export interface RentReceipt {
  id: string;
  amount: number | string;
  unallocatedAmount?: number | string;
  paidAt: string;
  type: "RENT" | "DEPOSIT";
  method?: string;
  reference?: string | null;
  notes?: string | null;
  tenant: {
    id: string;
    user: {
      fullName: string;
    };
  };
  lease: {
    id: string;
    rentAmount?: number | string;
    deposit?: number | string;
    startDate?: string;
    endDate?: string;
    unit: {
      unitNumber: string;
      property: {
        name: string;
        address?: string;
      };
    };
  };
  allocations?: Array<{
    amount: number | string;
    payment: {
      dueDate: string;
      periodStart?: string | null;
      periodEnd?: string | null;
    };
  }>;
}

export const paymentService = {
  async createPayment(data: CreatePaymentDto) {
    const response = await api.post("/payments", data);
    return response.data;
  },

  async getAllPayments() {
    const response = await api.get("/payments");
    return response.data;
  },

  async getPaymentsByTenant(tenantId: string) {
    const response = await api.get(`/payments/tenant/${tenantId}`);
    return response.data;
  },

  async getOverduePayments() {
    const response = await api.get("/payments/overdue");
    return response.data;
  },

  async getRentReceipts() {
    const response = await api.get("/payments/receipts");
    return response.data;
  },

  async recordRentReceipt(data: RecordRentReceiptDto) {
    const response = await api.post("/payments/receipts", data);
    return response.data;
  },

  async getPaymentById(id: string) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  async updatePayment(id: string, data: UpdatePaymentDto) {
    const response = await api.patch(`/payments/${id}`, data);
    return response.data;
  },

  async recordPayment(
    id: string,
    method: string,
    reference?: string,
    notes?: string,
  ) {
    const response = await api.post(`/payments/${id}/record`, {
      method,
      reference,
      notes,
    });
    return response.data;
  },

  async deletePayment(id: string) {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },
};
