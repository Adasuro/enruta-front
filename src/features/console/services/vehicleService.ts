import api from '../../../config/api';

export interface RouteRef {
  id: string;
  visual_code: string;
}

export interface Vehicle {
  id: string;
  business_id: string;
  route_id: string | null;
  plate_number: string;
  type: 'bus' | 'minibus' | 'van' | 'car';
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
  updated_at: string;
  route?: RouteRef;
}

export interface CreateVehicleDTO {
  business_id: string;
  plate_number: string;
  type: 'bus' | 'minibus' | 'van' | 'car';
  status: 'active' | 'maintenance' | 'inactive';
  route_id?: string | null;
}

export const vehicleService = {
  getVehicles: async (businessId: string): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>(`/v1/vehicles?business_id=${businessId}`);
    return response.data;
  },

  createVehicle: async (data: CreateVehicleDTO): Promise<Vehicle> => {
    const response = await api.post<Vehicle>('/v1/vehicles', data);
    return response.data;
  },

  updateRoute: async (vehicleId: string, routeId: string | null): Promise<Vehicle> => {
    const response = await api.patch<{message: string, vehicle: Vehicle}>(`/v1/vehicles/${vehicleId}/route`, { route_id: routeId });
    return response.data.vehicle;
  },

  updateStatus: async (vehicleId: string, status: Vehicle['status']): Promise<Vehicle> => {
    const response = await api.patch<{message: string, vehicle: Vehicle}>(`/v1/vehicles/${vehicleId}/status`, { status });
    return response.data.vehicle;
  }
};
