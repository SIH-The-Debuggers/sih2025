import Constants from 'expo-constants';

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://api.tourist-safety.example.com/v1';

export interface PanicAlertPayload {
  lat: number;
  lng: number;
  ts: number;
  userId?: string;
}

export interface SafetyScore {
  score: number;
  lastUpdated: string;
  factors: {
    crowdDensity: number;
    weatherConditions: number;
    criminalActivity: number;
    emergencyServices: number;
  };
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    phone: string;
    digitalTouristId: string;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, otp: string): Promise<LoginResponse> {
    // Mock implementation - replace with real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 'user-123',
            email,
            phone: '+91-9876543210',
            digitalTouristId: 'DT-2025-001234',
          },
        });
      }, 1500);
    });
  }

  // Panic Alert
  async sendPanicAlert(
    payload: PanicAlertPayload
  ): Promise<{ success: boolean; alertId: string }> {
    // Mock implementation - replace with real API call
    console.log('Sending panic alert:', payload);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          alertId: `alert-${Date.now()}`,
        });
      }, 1000);
    });
  }

  // Safety Score
  async getSafetyScore(lat: number, lng: number): Promise<SafetyScore> {
    // Mock implementation - replace with real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
          lastUpdated: new Date().toISOString(),
          factors: {
            crowdDensity: Math.floor(Math.random() * 100),
            weatherConditions: Math.floor(Math.random() * 100),
            criminalActivity: Math.floor(Math.random() * 100),
            emergencyServices: Math.floor(Math.random() * 100),
          },
        });
      }, 800);
    });
  }

  // Update location
  async updateLocation(
    lat: number,
    lng: number
  ): Promise<{ success: boolean }> {
    // Mock implementation - replace with real API call
    console.log('Updating location:', { lat, lng });

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }
}

export default new ApiService();
