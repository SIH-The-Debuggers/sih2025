export interface User {
  id: string;
  email: string;
  role: "TOURIST" | "POLICE" | "VERIFIER" | "CONTROL_ROOM";
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?:
    | TouristProfile
    | PoliceProfile
    | VerifierProfile
    | ControlRoomProfile;
}

export interface TouristProfile {
  id: string;
  userId: string;
  name: string;
  nationality: string;
  dateOfBirth?: string;
  passportNumber?: string;
  visaNumber?: string;
  documentType: "passport" | "visa" | "id_card";
  documentRef: string;
  phone?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  profilePicture?: string;
  preferredLanguage: string;
  isVerified: boolean;
}

export interface PoliceProfile {
  id: string;
  userId: string;
  badgeNumber: string;
  rank: string;
  department: string;
  station: string;
  contactNumber: string;
  isOnDuty: boolean;
}

export interface VerifierProfile {
  id: string;
  userId: string;
  organization: string;
  location: string;
  contactNumber: string;
  verificationLevel: number;
}

export interface ControlRoomProfile {
  id: string;
  userId: string;
  operatorId: string;
  shift: "DAY" | "NIGHT" | "EVENING";
  contactNumber: string;
}

export interface DigitalId {
  id: string;
  touristId: string;
  qrCode: string;
  anchorHash: string;
  isActive: boolean;
  issueDate: string;
  expiryDate?: string;
  verificationCount: number;
  tourist: TouristProfile;
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface LocationPing {
  id: string;
  touristId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  bearing?: number;
  speed?: number;
  batteryLevel?: number;
  isEmergency: boolean;
  timestamp: string;
  anomalies: string[];
}

export interface Alert {
  id: string;
  touristId: string;
  type: "PANIC" | "GEOFENCE" | "ANOMALY" | "SYSTEM";
  status: "ACTIVE" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED" | "FALSE_ALARM";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  emergencyType?: "MEDICAL" | "SECURITY" | "ACCIDENT" | "LOST" | "OTHER";
  description?: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tourist: TouristProfile;
  responses: AlertResponse[];
}

export interface AlertResponse {
  id: string;
  alertId: string;
  responderId: string;
  type: "ACKNOWLEDGE" | "DISPATCH" | "ARRIVED" | "RESOLVED";
  message?: string;
  estimatedArrival?: string;
  timestamp: string;
  responder: User;
}

export interface RiskZone {
  id: string;
  name: string;
  type: "HIGH_CRIME" | "RESTRICTED" | "UNSAFE" | "CONSTRUCTION" | "FLOOD_PRONE";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  coordinates: Array<[number, number]>; // [lng, lat] for GeoJSON compatibility
  description?: string;
  alertOnEntry: boolean;
  isActive: boolean;
}

export interface SafeZone {
  id: string;
  name: string;
  type:
    | "POLICE_STATION"
    | "HOSPITAL"
    | "EMBASSY"
    | "TOURIST_CENTER"
    | "SAFE_HOUSE";
  coordinates: Array<[number, number]>;
  services: string[];
  contactNumber?: string;
  operatingHours?: string;
  isActive: boolean;
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  profile: {
    name: string;
    nationality: string;
    documentType: "passport" | "visa" | "id_card";
    documentRef: string;
    phone?: string;
    preferredLanguage: string;
  };
  emergencyContacts: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
}

export interface PanicAlertForm {
  emergencyType: "MEDICAL" | "SECURITY" | "ACCIDENT" | "LOST" | "OTHER";
  description?: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface ProfileUpdateForm {
  name?: string;
  phone?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  preferredLanguage?: string;
}

// WebSocket Event Types
export interface WSLocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  batteryLevel?: number;
  speed?: number;
}

export interface WSPanicAlert {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  emergencyType: string;
  description?: string;
}

export interface WSAlertUpdate {
  alertId: string;
  status: string;
  message?: string;
  estimatedArrival?: string;
  responderInfo?: {
    name: string;
    badgeNumber: string;
    contact: string;
  };
}

// Map Types
export interface MapMarker {
  id: string;
  type: "tourist" | "police" | "alert" | "risk_zone" | "safe_zone";
  position: [number, number]; // [lng, lat]
  data: unknown;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Notification Types
export interface NotificationItem {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Settings Types
export interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    emergencyAlerts: boolean;
  };
  location: {
    shareLocation: boolean;
    highAccuracy: boolean;
    updateInterval: number;
  };
  privacy: {
    shareProfile: boolean;
    showOnMap: boolean;
    allowContactByPolice: boolean;
  };
  language: string;
  theme: "light" | "dark" | "system";
}
