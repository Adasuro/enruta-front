import api from '../../../config/api';

export interface Fleet {
  id: string;
  business_id: string;
  name: string;
  color_code: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  vehicles_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFleetDTO {
  business_id: string;
  name: string;
  color_code?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateFleetDTO {
  name: string;
  color_code?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export const fleetService = {
  getFleets: async (businessId: string): Promise<Fleet[]> => {
    const response = await api.get<Fleet[]>(`/v1/fleets?business_id=${businessId}`);
    return response.data;
  },

  createFleet: async (data: CreateFleetDTO): Promise<Fleet> => {
    const response = await api.post<Fleet>('/v1/fleets', data);
    return response.data;
  },

  updateFleet: async (fleetId: string, data: UpdateFleetDTO): Promise<Fleet> => {
    const response = await api.patch<{message: string, fleet: Fleet}>(`/v1/fleets/${fleetId}`, data);
    return response.data.fleet;
  },

  deleteFleet: async (fleetId: string): Promise<void> => {
    await api.delete(`/v1/fleets/${fleetId}`);
  }
};
