import api from '@/lib/api';

export interface RegisterTenantData {
  // Tenant Info
  email: string;
  fullName: string;
  phone?: string;
  nationalId?: string;
  emergencyContact?: string;
  occupation?: string;
  
  // Lease Info
  unitId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  deposit: number;
  paymentDueDay?: number;
  
  // Account Creation
  createAccount: boolean;
  password?: string;
}

export const tenantRegistrationService = {
  /**
   * Register a tenant and tenancy atomically.
   */
  async registerTenant(data: RegisterTenantData) {
    const response = await api.post('/tenants/register', {
      email: data.email,
      password: data.password || this.generatePassword(),
      fullName: data.fullName,
      phone: data.phone,
      nationalId: data.nationalId,
      emergencyContact: data.emergencyContact,
      occupation: data.occupation,
      unitId: data.unitId,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      rentAmount: Number(data.rentAmount),
      deposit: Number(data.deposit),
    });

    return response.data;
  },

  generatePassword(): string {
    // Generate a random 8-character password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },
};
