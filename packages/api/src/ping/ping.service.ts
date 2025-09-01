import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { AlertService } from "../alert/alert.service";

@Injectable()
export class PingService {
  constructor(
    private prisma: PrismaService,
    private alertService: AlertService
  ) {}

  async processBatchPings(
    touristId: string,
    pings: Array<{
      latitude: number;
      longitude: number;
      altitude?: number;
      speed?: number;
      accuracy?: number;
      bearing?: number;
      timestamp: string;
    }>
  ) {
    // Insert location pings
    const createdPings = await Promise.all(
      pings.map((ping) =>
        this.prisma.locationPing.create({
          data: {
            touristId,
            latitude: ping.latitude,
            longitude: ping.longitude,
            altitude: ping.altitude,
            speed: ping.speed,
            accuracy: ping.accuracy,
            bearing: ping.bearing,
            timestamp: new Date(ping.timestamp),
          },
        })
      )
    );

    // Process each ping for geofence violations
    for (const ping of pings) {
      await this.checkGeofenceViolations(touristId, ping);
    }

    // Check for anomalies
    await this.checkLocationAnomalies(touristId);

    return {
      processed: createdPings.length,
      pings: createdPings,
    };
  }

  async getLastKnownLocation(touristId: string) {
    const lastPing = await this.prisma.locationPing.findFirst({
      where: { touristId },
      orderBy: { timestamp: "desc" },
    });

    return lastPing;
  }

  async getLocationHistory(
    touristId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ) {
    return this.prisma.locationPing.findMany({
      where: {
        touristId,
        ...(options.startDate && { timestamp: { gte: options.startDate } }),
        ...(options.endDate && { timestamp: { lte: options.endDate } }),
      },
      orderBy: { timestamp: "desc" },
      take: options.limit || 100,
    });
  }

  async getTouristClusters(
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    },
    zoom: number = 10
  ) {
    return this.prisma.getLocationClusters(bounds, zoom);
  }

  async getNearbyTourists(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000
  ) {
    return this.prisma.findNearbyTourists(latitude, longitude, radiusMeters);
  }

  private async checkGeofenceViolations(
    touristId: string,
    location: { latitude: number; longitude: number }
  ) {
    // Query active risk zones that contain this location
    const violatedZones = await this.prisma.$queryRaw`
      SELECT rz.* FROM risk_zones rz
      WHERE rz.is_active = true
        AND ST_Contains(
          rz.geom,
          ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)
        );
    `;

    // Create alerts for each violated zone
    for (const zone of violatedZones as any[]) {
      // Check if there's already an active alert for this zone
      const existingAlert = await this.prisma.alert.findFirst({
        where: {
          touristId,
          riskZoneId: zone.id,
          type: "GEOFENCE",
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
        },
      });

      if (!existingAlert) {
        await this.alertService.createGeofenceAlert(
          touristId,
          zone.id,
          location
        );
      }
    }
  }

  private async checkLocationAnomalies(touristId: string) {
    // Get recent location history for anomaly detection
    const recentPings = await this.prisma.locationPing.findMany({
      where: {
        touristId,
        timestamp: {
          gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
        },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    if (recentPings.length < 2) return;

    // Check for inactivity (no movement for extended period)
    await this.checkInactivityAnomaly(touristId, recentPings);

    // Check for speed anomalies
    await this.checkSpeedAnomaly(touristId, recentPings);

    // Check for accuracy degradation (possible device issues)
    await this.checkAccuracyAnomaly(touristId, recentPings);
  }

  private async checkInactivityAnomaly(touristId: string, pings: any[]) {
    const inactivityThreshold = 30; // minutes

    if (pings.length === 0) return;

    const latestPing = pings[0];
    const minutesSinceLastPing =
      (Date.now() - new Date(latestPing.timestamp).getTime()) / (1000 * 60);

    if (minutesSinceLastPing > inactivityThreshold) {
      // Check if there's already an inactivity alert
      const existingAlert = await this.prisma.alert.findFirst({
        where: {
          touristId,
          type: "INACTIVITY",
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Within last hour
          },
        },
      });

      if (!existingAlert) {
        await this.prisma.alert.create({
          data: {
            type: "INACTIVITY",
            severity: 2,
            status: "OPEN",
            touristId,
            title: "Tourist Inactivity Detected",
            description: `No location updates received for ${Math.round(minutesSinceLastPing)} minutes`,
            latitude: latestPing.latitude,
            longitude: latestPing.longitude,
            metadata: {
              lastSeenAt: latestPing.timestamp,
              minutesInactive: Math.round(minutesSinceLastPing),
            },
          },
        });
      }
    }
  }

  private async checkSpeedAnomaly(touristId: string, pings: any[]) {
    if (pings.length < 2) return;

    const speeds = pings
      .filter((p) => p.speed !== null && p.speed !== undefined)
      .map((p) => p.speed);

    if (speeds.length === 0) return;

    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);

    // Detect unusually high speed (possible vehicle accident or kidnapping)
    if (maxSpeed > 80) {
      // 80 m/s = ~290 km/h
      await this.prisma.alert.create({
        data: {
          type: "SPEED_ANOMALY",
          severity: 4,
          status: "OPEN",
          touristId,
          title: "Unusual Speed Detected",
          description: `Tourist moving at abnormal speed: ${Math.round(maxSpeed * 3.6)} km/h`,
          latitude: pings[0].latitude,
          longitude: pings[0].longitude,
          metadata: {
            maxSpeed: maxSpeed,
            avgSpeed: avgSpeed,
            timestamp: pings[0].timestamp,
          },
        },
      });
    }
  }

  private async checkAccuracyAnomaly(touristId: string, pings: any[]) {
    const accuracies = pings
      .filter((p) => p.accuracy !== null && p.accuracy !== undefined)
      .map((p) => p.accuracy);

    if (accuracies.length === 0) return;

    const avgAccuracy =
      accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

    // Alert if GPS accuracy suddenly degrades (possible device tampering)
    if (avgAccuracy > 100) {
      // More than 100 meters accuracy
      const existingAlert = await this.prisma.alert.findFirst({
        where: {
          touristId,
          type: "DROP",
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Within last hour
          },
        },
      });

      if (!existingAlert) {
        await this.prisma.alert.create({
          data: {
            type: "DROP",
            severity: 3,
            status: "OPEN",
            touristId,
            title: "GPS Signal Degradation",
            description: `Poor GPS accuracy detected: ${Math.round(avgAccuracy)}m`,
            latitude: pings[0].latitude,
            longitude: pings[0].longitude,
            metadata: {
              avgAccuracy: avgAccuracy,
              possibleCause: "Device tampering or environmental interference",
            },
          },
        });
      }
    }
  }
}
