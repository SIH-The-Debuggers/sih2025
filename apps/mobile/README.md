# Tourist Safety Mobile App

A React Native mobile application built with Expo for the Tourist Safety Monitoring system. This app provides tourists with essential safety features including emergency alerts, safety scores, and digital tourist ID management.

## Features

- **Authentication**: OTP-based email verification system
- **Digital Tourist ID**: QR code generation for tourist identification
- **Emergency Alert**: Panic button that sends location-based emergency alerts
- **Safety Score**: Real-time safety assessment of current area
- **Location Tracking**: GPS-based location services with privacy controls
- **Emergency Contacts**: Manage emergency contact list
- **Settings**: Customize app preferences and safety settings

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack Navigator)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Package Manager**: Bun
- **Storage**: AsyncStorage for local data persistence
- **Location**: Expo Location for GPS services
- **QR Code**: react-native-qrcode-svg for QR generation

## Directory Structure

```
src/
├── screens/          # App screens
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── PanicScreen.tsx
│   ├── SafetyScreen.tsx
│   └── SettingsScreen.tsx
├── components/       # Reusable UI components
├── services/         # API and storage services
│   ├── api.ts
│   └── storage.ts
└── hooks/           # Custom React hooks
    └── useLocation.ts
```

## Installation

1. **Prerequisites**:
   - Node.js (v18 or later)
   - Bun package manager
   - Expo CLI (`npm install -g @expo/cli`)
   - iOS Simulator or Android Emulator (for testing)

2. **Install dependencies**:
   ```bash
   cd apps/mobile
   bun install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your API configuration
   ```

## Development

### Available Scripts

- `bun dev` or `bun start` - Start the Expo development server
- `bun android` - Run on Android emulator/device
- `bun ios` - Run on iOS simulator/device
- `bun web` - Run in web browser
- `bun lint` - Run ESLint
- `bun lint:fix` - Fix ESLint errors automatically
- `bun format` - Format code with Prettier
- `bun type-check` - Run TypeScript type checking

### Starting Development

1. Start the development server:
   ```bash
   bun dev
   ```

2. Use the Expo CLI to run on your preferred platform:
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for web
   - Scan QR code with Expo Go app on your device

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
BASE_URL=https://your-api-endpoint.com
API_VERSION=v1
EXPO_PUBLIC_API_BASE_URL=https://your-api-endpoint.com/v1
```

### API Integration

The app includes a mock API service (`src/services/api.ts`) with the following endpoints:

- **Authentication**: `POST /auth/login`
- **Panic Alert**: `POST /alert/panic`
- **Safety Score**: `GET /safety/score`
- **Location Update**: `POST /location/update`

Replace the mock implementations with real API calls as needed.

## Features Overview

### Authentication Flow
- Email-based login with OTP verification
- Persistent session storage
- Automatic token management

### Emergency Features
- One-tap panic button with haptic feedback
- Automatic location detection and sharing
- Emergency contact notifications
- Integration with local emergency services

### Safety Monitoring
- Real-time area safety scoring
- Multiple safety factors analysis
- Personalized safety recommendations
- Location-based risk assessment

### Digital Tourist ID
- QR code generation with tourist information
- Secure identity verification
- Integration with tourism services
- Offline accessibility

## Permissions

The app requires the following permissions:

- **Location**: For emergency alerts and safety scoring
- **Network**: For API communication
- **Vibration**: For emergency alert feedback

## Building for Production

### Android
```bash
bun run build:android
```

### iOS
```bash
bun run build:ios
```

## Security Considerations

- All sensitive data is stored locally using AsyncStorage
- API communications should use HTTPS
- Location data is only shared during emergencies or with explicit consent
- Emergency contacts are stored locally and encrypted

## Contributing

1. Follow the existing code style and conventions
2. Run linting and type checking before committing
3. Test on both iOS and Android platforms
4. Update documentation for new features

## License

This project is part of the Smart Tourist Safety Monitoring system developed for SIH 2025.
