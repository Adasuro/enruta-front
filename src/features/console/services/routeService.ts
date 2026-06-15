import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Point {
  lat: number;
  lng: number;
}

export interface VehicleReference {
  type: string;
  photo_front_url?: string;
  photo_sign_url?: string;
  photo_side_url?: string;
}

export interface JourneyStep {
  type: 'WALK' | 'TRANSIT';
  distance_m?: number;
  instruction?: string;
  route_info?: {
    id: string;
    name: string | null;
    visual_code: string;
    color_primary: string;
    color_secondary: string | null;
  };
  vehicle_references?: VehicleReference[];
  boarding_stop?: string;
  exit_stop?: string;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export interface Journey {
  id: string;
  tags: string[];
  summary: {
    total_fare: number;
    currency: string;
    total_duration_min: number;
  };
  steps: JourneyStep[];
}

export interface RoutingResult {
  search_meta: {
    origin: Point;
    destination: Point;
    radius_reached: number;
  };
  journeys: Journey[];
}

export const routeService = {
  searchRoutes: async (origin: Point, destination: Point, maxTolerance: number = 300): Promise<RoutingResult> => {
    const token = localStorage.getItem('enruta_token');
    const response = await axios.post(`${API_URL}/enrutamiento/search`, {
      origin,
      destination,
      max_tolerance: maxTolerance
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  }
};
