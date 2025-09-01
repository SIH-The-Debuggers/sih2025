import { useState, useEffect, useCallback } from "react";
import { LOCATION_UPDATE_INTERVAL, HIGH_ACCURACY_GPS } from "./config";
import { locationAPI } from "./api";
import { wsService } from "./websocket";
import type { LocationPing } from "./types";

interface LocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  bearing?: number;
  speed?: number;
  timestamp: string;
}

interface LocationError {
  code: number;
  message: string;
}

interface UseLocationReturn {
  location: LocationState | null;
  error: LocationError | null;
  isTracking: boolean;
  permissionStatus: PermissionState | null;
  startTracking: () => void;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
  sendLocationPing: (isEmergency?: boolean) => Promise<void>;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionState | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Check permission status
  useEffect(() => {
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermissionStatus(result.state);
        result.addEventListener("change", () => {
          setPermissionStatus(result.state);
        });
      });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionStatus("granted");
          resolve(true);
        },
        (err) => {
          setError({
            code: err.code,
            message: err.message,
          });
          setPermissionStatus("denied");
          resolve(false);
        },
        {
          enableHighAccuracy: HIGH_ACCURACY_GPS,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, []);

  const handleLocationUpdate = useCallback((position: GeolocationPosition) => {
    const newLocation: LocationState = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      bearing: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
      timestamp: new Date().toISOString(),
    };

    setLocation(newLocation);
    setError(null);

    // Send to WebSocket if connected
    if (wsService.isConnected) {
      wsService.sendLocationUpdate({
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        accuracy: newLocation.accuracy,
        timestamp: newLocation.timestamp,
        speed: newLocation.speed,
      });
    }
  }, []);

  const handleLocationError = useCallback((err: GeolocationPositionError) => {
    setError({
      code: err.code,
      message: err.message,
    });
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: "Geolocation is not supported by this browser.",
      });
      return;
    }

    if (permissionStatus === "denied") {
      setError({
        code: 1,
        message: "Location permission denied. Please enable location access.",
      });
      return;
    }

    const id = navigator.geolocation.watchPosition(
      handleLocationUpdate,
      handleLocationError,
      {
        enableHighAccuracy: HIGH_ACCURACY_GPS,
        timeout: 10000,
        maximumAge: LOCATION_UPDATE_INTERVAL,
      }
    );

    setWatchId(id);
    setIsTracking(true);
  }, [permissionStatus, handleLocationUpdate, handleLocationError]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  const sendLocationPing = useCallback(
    async (isEmergency = false) => {
      if (!location) {
        throw new Error("No location available");
      }

      try {
        await locationAPI.sendPing({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          altitude: location.altitude,
          bearing: location.bearing,
          speed: location.speed,
          isEmergency,
        });
      } catch (error) {
        console.error("Failed to send location ping:", error);
        throw error;
      }
    },
    [location]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    error,
    isTracking,
    permissionStatus,
    startTracking,
    stopTracking,
    requestPermission,
    sendLocationPing,
  };
}
