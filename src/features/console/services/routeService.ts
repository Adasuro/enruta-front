import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Point {
  lat: number;
  lng: number;
}

export interface RoutingResult {
  radius_reached: number;
  results: RouteResult[];
}

export interface RouteResult {
  id: string;
  visual_code: string;
  display_name: string | null;
  color_primary: string;
  color_secondary: string | null;
  path_geojson: any;
  boarding_point: {
    type: string;
    coordinates: [number, number];
  };
  fare: {
    amount: number;
    currency: string;
  };
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
