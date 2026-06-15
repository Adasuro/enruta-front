import api from '../../../config/api';

export interface FleetRef {
  id: string;
  name: string;
}

export interface Vehicle {
  id: string;
  business_id: string;
  fleet_id: string | null;
  plate_number: string;
  brand?: string;
  model_name?: string;
  year?: number;
  status: 'active' | 'maintenance' | 'inactive';
  soat?: string;
  photo_front?: string | null;
  photo_side?: string | null;
  photo_sign?: string | null;
  created_at: string;
  updated_at: string;
  fleet?: FleetRef;
}

export interface CreateVehicleDTO {
  business_id: string;
  plate_number: string;
  status: 'active' | 'maintenance' | 'inactive';
  brand?: string;
  model_name?: string;
  year?: number;
  fleet_id?: string | null;
  soat?: string;
  photo_front?: File;
  photo_side?: File;
  photo_sign?: File;
}

export const vehicleService = {
  getVehicles: async (businessId: string): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>(`/v1/vehicles?business_id=${businessId}`);
    return response.data;
  },

  createVehicle: async (data: CreateVehicleDTO): Promise<Vehicle> => {
    const formData = new FormData();
    formData.append('business_id', data.business_id);
    formData.append('plate_number', data.plate_number);
    formData.append('status', data.status);
    
    if (data.brand) formData.append('brand', data.brand);
    if (data.model_name) formData.append('model_name', data.model_name);
    if (data.year) formData.append('year', data.year.toString());
    if (data.fleet_id) formData.append('fleet_id', data.fleet_id);
    if (data.soat) formData.append('soat', data.soat);
    
    if (data.photo_front) formData.append('photo_front', data.photo_front);
    if (data.photo_side) formData.append('photo_side', data.photo_side);
    if (data.photo_sign) formData.append('photo_sign', data.photo_sign);

    const response = await api.post<Vehicle>('/v1/vehicles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateVehicle: async (id: string, data: Partial<CreateVehicleDTO>): Promise<Vehicle> => {
    const formData = new FormData();
    // Laravel/PHP requires _method=PATCH or just POST for files sometimes, 
    // but our route is POST /v1/vehicles/{vehicle} specifically for updates.
    if (data.business_id) formData.append('business_id', data.business_id);
    if (data.plate_number) formData.append('plate_number', data.plate_number);
    if (data.status) formData.append('status', data.status);
    
    if (data.brand !== undefined) formData.append('brand', data.brand || '');
    if (data.model_name !== undefined) formData.append('model_name', data.model_name || '');
    if (data.year !== undefined) formData.append('year', data.year?.toString() || '');
    if (data.fleet_id !== undefined) formData.append('fleet_id', data.fleet_id || '');
    if (data.soat !== undefined) formData.append('soat', data.soat || '');
    
    if (data.photo_front instanceof File) formData.append('photo_front', data.photo_front);
    if (data.photo_side instanceof File) formData.append('photo_side', data.photo_side);
    if (data.photo_sign instanceof File) formData.append('photo_sign', data.photo_sign);

    const response = await api.post<Vehicle>(`/v1/vehicles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateFleet: async (vehicleId: string, fleetId: string | null): Promise<Vehicle> => {
    const response = await api.patch<{message: string, vehicle: Vehicle}>(`/v1/vehicles/${vehicleId}/fleet`, { fleet_id: fleetId });
    return response.data.vehicle;
  },

  updateStatus: async (vehicleId: string, status: Vehicle['status']): Promise<Vehicle> => {
    const response = await api.patch<{message: string, vehicle: Vehicle}>(`/v1/vehicles/${vehicleId}/status`, { status });
    return response.data.vehicle;
  },

  deleteVehicle: async (vehicleId: string): Promise<void> => {
    await api.delete(`/v1/vehicles/${vehicleId}`);
  }
};

