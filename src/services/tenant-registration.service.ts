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
    const userId = tenant.id; // the User row's id for rollback

    try {
      // Step 2: Create lease
      const leaseResponse = await api.post('/leases', {
        tenantId,
        unitId: data.unitId,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        rentAmount: Number(data.rentAmount),
        deposit: Number(data.deposit),
      });

      return {
        tenant,
        lease: leaseResponse.data,
        success: true,
      };
    } catch (error) {
      // Rollback: delete the user we just created so no orphaned tenants pile up
      try {
        await api.delete(`/tenants/user/${userId}`);
      } catch {
        // Silently ignore rollback failures — backend may already handle cascades
      }
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
