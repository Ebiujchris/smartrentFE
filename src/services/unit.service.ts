import api from '@/lib/api';
import type { Unit, UnitStatus } from '@/services/property.service';

export const unitService = {
  async updateStatus(unitId: string, status: UnitStatus): Promise<Unit> {
    const response = await api.patch(`/units/${unitId}`, { status });
    return response.data;
  },
};
