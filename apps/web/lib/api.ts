import axios from "axios";
import { API_BASE_URL } from "./config";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("tourist_auth_token")
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      if (typeof window !== "undefined") {
        localStorage.removeItem("tourist_auth_token");
        localStorage.removeItem("tourist_profile");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  register: (userData: {
    email: string;
    password: string;
    role: string;
    profile: any;
  }) => api.post("/auth/register", userData),

  logout: () => api.post("/auth/logout"),

  refreshToken: () => api.post("/auth/refresh"),

  sendOTP: (phone: string) => api.post("/auth/send-otp", { phone }),

  verifyOTP: (phone: string, otp: string) =>
    api.post("/auth/verify-otp", { phone, otp }),
};

// Digital Tourist ID API
export const dtidAPI = {
  create: (data: any) => api.post("/dtid/create", data),

  get: (id: string) => api.get(`/dtid/${id}`),

  verify: (id: string, location: any) =>
    api.post(`/dtid/${id}/verify`, { location }),

  getMyDigitalId: () => api.get("/dtid/my-id"),

  updateEmergencyContacts: (contacts: any[]) =>
    api.put("/dtid/emergency-contacts", { contacts }),
};

// Alert API
export const alertAPI = {
  createPanic: (data: {
    location: { latitude: number; longitude: number; accuracy: number };
    emergencyType: string;
    description?: string;
  }) => api.post("/alert/panic", data),

  getActiveAlerts: (params?: { radius?: number; lat?: number; lng?: number }) =>
    api.get("/alert/active", { params }),

  getAlert: (id: string) => api.get(`/alert/${id}`),

  getMyAlerts: (params?: { status?: string; limit?: number }) =>
    api.get("/alert/my-alerts", { params }),

  cancelAlert: (id: string, reason?: string) =>
    api.put(`/alert/${id}/cancel`, { reason }),
};

// Location Tracking API
export const locationAPI = {
  sendPing: (data: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    bearing?: number;
    speed?: number;
    batteryLevel?: number;
    isEmergency?: boolean;
  }) => api.post("/ping/location", data),

  sendBatchPings: (pings: any[]) => api.post("/ping/batch", { pings }),

  getMyRecentPings: (hours: number = 24) =>
    api.get("/ping/my-recent", { params: { hours } }),

  getNearbyRiskZones: (lat: number, lng: number, radius: number = 5000) =>
    api.get("/ping/risk-zones", { params: { lat, lng, radius } }),

  getSafeZones: (lat: number, lng: number, radius: number = 5000) =>
    api.get("/ping/safe-zones", { params: { lat, lng, radius } }),
};

// User Profile API
export const userAPI = {
  getProfile: () => api.get("/users/profile"),

  updateProfile: (data: any) => api.put("/users/profile", data),

  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("photo", file);
    return api.post("/users/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteAccount: () => api.delete("/users/account"),

  getSettings: () => api.get("/users/settings"),

  updateSettings: (settings: any) => api.put("/users/settings", settings),
};

// Emergency API
export const emergencyAPI = {
  getEmergencyNumbers: () => api.get("/emergency/numbers"),

  getNearbyServices: (lat: number, lng: number, type?: string) =>
    api.get("/emergency/nearby", { params: { lat, lng, type } }),

  reportIncident: (data: {
    type: string;
    description: string;
    location: { latitude: number; longitude: number };
    media?: File[];
  }) => {
    const formData = new FormData();
    formData.append("type", data.type);
    formData.append("description", data.description);
    formData.append("location", JSON.stringify(data.location));

    if (data.media) {
      data.media.forEach((file, index) => {
        formData.append(`media[${index}]`, file);
      });
    }

    return api.post("/emergency/report", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Health Check API
export const healthAPI = {
  check: () => api.get("/health"),
  ready: () => api.get("/health/ready"),
  live: () => api.get("/health/live"),
};

export default api;
