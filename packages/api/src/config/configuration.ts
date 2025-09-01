import { ConfigModule } from "@nestjs/config";

export default () => ({
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-jwt-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  // Database Configuration
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/tourist_safety",

  // Redis Configuration
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // Blockchain Configuration
  BLOCKCHAIN_ENABLED: process.env.BLOCKCHAIN_ENABLED === "true",
  BLOCKCHAIN_PROVIDER_URL:
    process.env.BLOCKCHAIN_PROVIDER_URL ||
    "https://rpc-amoy.polygon.technology",
  BLOCKCHAIN_PRIVATE_KEY: process.env.BLOCKCHAIN_PRIVATE_KEY || "",
  TOURIST_ID_CONTRACT_ADDRESS: process.env.TOURIST_ID_CONTRACT_ADDRESS || "",

  // Encryption
  ENCRYPTION_KEY:
    process.env.ENCRYPTION_KEY || "default-encryption-key-change-in-production",

  // SMS/Notification Services
  SMS_PROVIDER_API_KEY: process.env.SMS_PROVIDER_API_KEY || "",
  SMS_PROVIDER_URL: process.env.SMS_PROVIDER_URL || "",

  // Google Maps API
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",

  // Application Configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),

  // CORS Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3001",
  MOBILE_APP_URL: process.env.MOBILE_APP_URL || "http://localhost:3002",

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB
  UPLOAD_DEST: process.env.UPLOAD_DEST || "./uploads",

  // Rate Limiting
  RATE_LIMIT_TTL: parseInt(process.env.RATE_LIMIT_TTL || "60", 10), // 1 minute
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100", 10), // 100 requests per minute

  // Geofencing
  DEFAULT_GEOFENCE_RADIUS: parseInt(
    process.env.DEFAULT_GEOFENCE_RADIUS || "1000",
    10
  ), // 1km

  // Alert Configuration
  ALERT_ESCALATION_TIME: parseInt(
    process.env.ALERT_ESCALATION_TIME || "300",
    10
  ), // 5 minutes
  MAX_ALERT_RADIUS: parseInt(process.env.MAX_ALERT_RADIUS || "50000", 10), // 50km

  // Location Tracking
  LOCATION_PING_INTERVAL: parseInt(
    process.env.LOCATION_PING_INTERVAL || "30",
    10
  ), // 30 seconds
  LOCATION_BATCH_SIZE: parseInt(process.env.LOCATION_BATCH_SIZE || "50", 10),

  // Anomaly Detection Thresholds
  HIGH_SPEED_THRESHOLD: parseFloat(process.env.HIGH_SPEED_THRESHOLD || "100.0"), // km/h
  LOW_ACCURACY_THRESHOLD: parseFloat(
    process.env.LOW_ACCURACY_THRESHOLD || "100.0"
  ), // meters
  INACTIVITY_THRESHOLD: parseInt(
    process.env.INACTIVITY_THRESHOLD || "3600",
    10
  ), // 1 hour

  // WebSocket Configuration
  WS_CORS_ORIGIN: process.env.WS_CORS_ORIGIN || [
    "http://localhost:3001",
    "http://localhost:3002",
  ],
  WS_MAX_CONNECTIONS: parseInt(process.env.WS_MAX_CONNECTIONS || "1000", 10),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE: process.env.LOG_FILE || "./logs/app.log",

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10),
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5", 10),

  // External APIs
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || "",
  TRANSLATION_API_KEY: process.env.TRANSLATION_API_KEY || "",

  // Monitoring
  HEALTH_CHECK_INTERVAL: parseInt(
    process.env.HEALTH_CHECK_INTERVAL || "60",
    10
  ), // seconds
  METRICS_ENABLED: process.env.METRICS_ENABLED === "true",
});
