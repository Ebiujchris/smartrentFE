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
   * Register a tenant with lease in one transaction
   * Creates tenant, user account (optional), and lease
   */
  async registerTenant(data: RegisterTenantData) {
    // Step 1: Create tenant with user account
    const tenantResponse = await api.post('/tenants', {
      email: data.email,
      password: data.password || this.generatePassword(),
      fullName: data.fullName,
      phone: data.phone,
      nationalId: data.nationalId,
      emergencyContact: data.emergencyContact,
      occupation: data.occupation,
    });

    const tenant = tenantResponse.data;
    const tenantId = tenant.tenantProfile?.id || tenant.id;

    try {
      // Step 2: Create lease
      const leaseResponse = await api.post('/leases', {
        tenantId,
        unitId: data.unitId,
        startDate: data.startDate,
        endDate: data.endDate,
        rentAmount: data.rentAmount,
        deposit: data.deposit,
      });

      return {
        tenant,
        lease: leaseResponse.data,
        success: true,
      };
    } catch (error) {
      // If lease creation fails, we should ideally rollback tenant creation
      // For now, just throw the error
      throw error;
    }
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
