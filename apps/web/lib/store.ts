import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, DigitalId, Alert, UserSettings } from "./types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

interface DigitalIdState {
  digitalId: DigitalId | null;
  qrCode: string | null;
  isVerified: boolean;
  setDigitalId: (digitalId: DigitalId | null) => void;
  setQrCode: (qrCode: string | null) => void;
  setVerified: (verified: boolean) => void;
}

interface AlertState {
  activeAlerts: Alert[];
  myAlerts: Alert[];
  currentAlert: Alert | null;
  addAlert: (alert: Alert) => void;
  updateAlert: (alertId: string, updates: Partial<Alert>) => void;
  setActiveAlerts: (alerts: Alert[]) => void;
  setMyAlerts: (alerts: Alert[]) => void;
  setCurrentAlert: (alert: Alert | null) => void;
  clearAlerts: () => void;
}

interface SettingsState {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

// Default settings
const defaultSettings: UserSettings = {
  notifications: {
    push: true,
    email: true,
    sms: true,
    emergencyAlerts: true,
  },
  location: {
    shareLocation: true,
    highAccuracy: true,
    updateInterval: 30,
  },
  privacy: {
    shareProfile: false,
    showOnMap: true,
    allowContactByPolice: true,
  },
  language: "en",
  theme: "system",
};

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: (token: string, user: User) =>
        set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      updateUser: (userUpdates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userUpdates } : null,
        })),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "tourist-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Digital ID Store
export const useDigitalIdStore = create<DigitalIdState>()(
  persist(
    (set) => ({
      digitalId: null,
      qrCode: null,
      isVerified: false,
      setDigitalId: (digitalId) => set({ digitalId }),
      setQrCode: (qrCode) => set({ qrCode }),
      setVerified: (verified) => set({ isVerified: verified }),
    }),
    {
      name: "tourist-digital-id",
    }
  )
);

// Alert Store
export const useAlertStore = create<AlertState>()((set) => ({
  activeAlerts: [],
  myAlerts: [],
  currentAlert: null,
  addAlert: (alert) =>
    set((state) => ({
      activeAlerts: [alert, ...state.activeAlerts],
      myAlerts: [alert, ...state.myAlerts],
    })),
  updateAlert: (alertId, updates) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, ...updates } : alert
      ),
      myAlerts: state.myAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, ...updates } : alert
      ),
      currentAlert:
        state.currentAlert?.id === alertId
          ? { ...state.currentAlert, ...updates }
          : state.currentAlert,
    })),
  setActiveAlerts: (alerts) => set({ activeAlerts: alerts }),
  setMyAlerts: (alerts) => set({ myAlerts: alerts }),
  setCurrentAlert: (alert) => set({ currentAlert: alert }),
  clearAlerts: () =>
    set({
      activeAlerts: [],
      myAlerts: [],
      currentAlert: null,
    }),
}));

// Settings Store
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: "tourist-settings",
    }
  )
);

// Location Store
interface LocationState {
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null;
  isTracking: boolean;
  locationHistory: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
  setCurrentLocation: (location: LocationState["currentLocation"]) => void;
  setTracking: (tracking: boolean) => void;
  addLocationToHistory: (location: {
    latitude: number;
    longitude: number;
    timestamp: string;
  }) => void;
  clearLocationHistory: () => void;
}

export const useLocationStore = create<LocationState>()((set) => ({
  currentLocation: null,
  isTracking: false,
  locationHistory: [],
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setTracking: (tracking) => set({ isTracking: tracking }),
  addLocationToHistory: (location) =>
    set((state) => ({
      locationHistory: [location, ...state.locationHistory.slice(0, 99)], // Keep last 100 locations
    })),
  clearLocationHistory: () => set({ locationHistory: [] }),
}));

// WebSocket Connection Store
interface WebSocketState {
  isConnected: boolean;
  connectionId: string | null;
  lastHeartbeat: string | null;
  setConnected: (connected: boolean) => void;
  setConnectionId: (id: string | null) => void;
  setLastHeartbeat: (timestamp: string) => void;
}

export const useWebSocketStore = create<WebSocketState>()((set) => ({
  isConnected: false,
  connectionId: null,
  lastHeartbeat: null,
  setConnected: (connected) => set({ isConnected: connected }),
  setConnectionId: (id) => set({ connectionId: id }),
  setLastHeartbeat: (timestamp) => set({ lastHeartbeat: timestamp }),
}));
