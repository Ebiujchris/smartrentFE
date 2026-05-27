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

export const paymentService = {
  async createPayment(data: CreatePaymentDto) {
    const response = await api.post("/payments", data);
    return response.data;
  },

  async getAllPayments() {
    const response = await api.get("/payments");
    return response.data;
  },

  async getOverduePayments() {
    const response = await api.get("/payments/overdue");
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
