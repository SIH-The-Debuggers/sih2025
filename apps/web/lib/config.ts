// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";

// MapBox Configuration
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// App Configuration
export const APP_NAME = "Tourist Safety Platform";
export const APP_VERSION = "1.0.0";

// Location Configuration
export const DEFAULT_LOCATION = {
  latitude: 28.6139, // New Delhi
  longitude: 77.209,
  zoom: 12,
};

// Emergency Configuration
export const EMERGENCY_NUMBERS = {
  police: "100",
  medical: "108",
  fire: "101",
  tourist_helpline: "1363",
};

// Geofencing Configuration
export const GEOFENCE_RADIUS = 1000; // meters

// Location Tracking Configuration
export const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds
export const HIGH_ACCURACY_GPS = true;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "tourist_auth_token",
  USER_PROFILE: "tourist_profile",
  DIGITAL_ID: "digital_id",
  EMERGENCY_CONTACTS: "emergency_contacts",
  LOCATION_PERMISSION: "location_permission",
} as const;

// WebSocket Events
export const WS_EVENTS = {
  // Tourist Events
  LOCATION_UPDATE: "location-update",
  PANIC_ALERT: "panic-alert",

  // Incoming Events
  LOCATION_ACKNOWLEDGED: "location-acknowledged",
  PANIC_ACKNOWLEDGED: "panic-acknowledged",
  ALERT_UPDATE: "alert-update",
  EMERGENCY_BROADCAST: "emergency-broadcast",
} as const;
