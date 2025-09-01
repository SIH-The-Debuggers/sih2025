import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class AlertService {
  constructor(
    private prisma: PrismaService
    // private notifyService: NotifyService,
    // private websocketGateway: WebsocketGateway,
  ) {}

  async createPanicAlert(
    touristId: string,
    alertData: {
      latitude?: number;
      longitude?: number;
      message?: string;
      metadata?: any;
    }
  ) {
    // Create the alert
    const alert = await this.prisma.alert.create({
      data: {
        type: "PANIC",
        severity: 5, // Maximum severity for panic
        status: "OPEN",
        touristId,
        title: "Emergency: Panic Button Activated",
        description:
          alertData.message || "Tourist has activated emergency panic button",
        latitude: alertData.latitude,
        longitude: alertData.longitude,
        metadata: {
          ...alertData.metadata,
          timestamp: new Date().toISOString(),
          source: "panic_button",
        },
      },
      include: {
        tourist: {
          include: {
            emergencyContacts: true,
            user: true,
          },
        },
      },
    });

    // Find nearest police unit
    if (alertData.latitude && alertData.longitude) {
      const nearestUnits = await this.findNearestPoliceUnits(
        alertData.latitude,
        alertData.longitude,
        5000 // 5km radius
      );

      if (nearestUnits.length > 0) {
        await this.prisma.alert.update({
          where: { id: alert.id },
          data: { assignedTo: nearestUnits[0].id },
        });
      }
    }

    // Send notifications (will implement after notify module)
    // await this.notifyEmergencyContacts(alert);
    // await this.notifyPoliceUnits(alert);

    // Broadcast via WebSocket (will implement after websocket module)
    // this.websocketGateway.broadcastToNamespace('ops', 'alerts:new', alert);

    return alert;
  }

  async createGeofenceAlert(
    touristId: string,
    riskZoneId: string,
    location: { latitude: number; longitude: number }
  ) {
    const riskZone = await this.prisma.riskZone.findUnique({
      where: { id: riskZoneId },
    });

    if (!riskZone) {
      throw new Error("Risk zone not found");
    }

    const alert = await this.prisma.alert.create({
      data: {
        type: "GEOFENCE",
        severity: this.mapRiskLevelToSeverity(riskZone.level),
        status: "OPEN",
        touristId,
        riskZoneId,
        title: `Tourist entered ${riskZone.level.toLowerCase()} risk zone`,
        description: `Tourist has entered ${riskZone.name}: ${riskZone.description}`,
        latitude: location.latitude,
        longitude: location.longitude,
        metadata: {
          riskZone: {
            name: riskZone.name,
            level: riskZone.level,
          },
          entryTime: new Date().toISOString(),
        },
      },
      include: {
        tourist: true,
        riskZone: true,
      },
    });

    return alert;
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    const alert = await this.prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedAt: new Date(),
        acknowledgedBy: userId,
      },
      include: {
        tourist: true,
      },
    });

    // Broadcast update
    // this.websocketGateway.broadcastToNamespace('ops', 'alerts:update', alert);

    return alert;
  }

  async resolveAlert(alertId: string, userId: string, resolution: string) {
    const alert = await this.prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolution,
      },
      include: {
        tourist: true,
      },
    });

    return alert;
  }

  async getActiveAlerts(filters?: {
    type?: string;
    severity?: number;
    assignedTo?: string;
  }) {
    return this.prisma.alert.findMany({
      where: {
        status: { in: ["OPEN", "ACKNOWLEDGED"] },
        ...(filters?.type && { type: filters.type as any }),
        ...(filters?.severity && { severity: filters.severity }),
        ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
      },
      include: {
        tourist: {
          select: {
            name: true,
            nationality: true,
            didUri: true,
          },
        },
        riskZone: {
          select: {
            name: true,
            level: true,
          },
        },
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    });
  }

  async getAlertsHistory(filters?: {
    touristId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    return this.prisma.alert.findMany({
      where: {
        ...(filters?.touristId && { touristId: filters.touristId }),
        ...(filters?.startDate && { createdAt: { gte: filters.startDate } }),
        ...(filters?.endDate && { createdAt: { lte: filters.endDate } }),
      },
      include: {
        tourist: {
          select: {
            name: true,
            nationality: true,
          },
        },
        riskZone: {
          select: {
            name: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 100,
    });
  }

  private async findNearestPoliceUnits(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000
  ) {
    // This would use PostGIS in production
    return this.prisma.$queryRaw`
      SELECT pp.*, u.email,
             ST_Distance(
               ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
               ST_SetSRID(ST_MakePoint(pp.current_lng, pp.current_lat), 4326)::geography
             ) as distance_meters
      FROM police_profiles pp
      INNER JOIN users u ON pp.user_id = u.id
      WHERE pp.is_on_duty = true
        AND pp.current_lat IS NOT NULL
        AND pp.current_lng IS NOT NULL
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ST_SetSRID(ST_MakePoint(pp.current_lng, pp.current_lat), 4326)::geography,
          ${radiusMeters}
        )
      ORDER BY distance_meters
      LIMIT 5;
    `;
  }

  private mapRiskLevelToSeverity(level: string): number {
    const mapping = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
      EXTREME: 5,
    };
    return mapping[level as keyof typeof mapping] || 1;
  }
}
