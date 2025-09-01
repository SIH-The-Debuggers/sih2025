import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get("DATABASE_URL"),
        },
      },
      log: ["query", "info", "warn", "error"],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Custom query methods for PostGIS operations
  async findNearbyTourists(
    lat: number,
    lng: number,
    radiusMeters: number = 1000
  ) {
    return this.$queryRaw`
      SELECT tp.id, tp.name, tp.did_uri, lp.latitude, lp.longitude, lp.timestamp,
             ST_Distance(
               ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
               ST_SetSRID(ST_MakePoint(lp.longitude, lp.latitude), 4326)::geography
             ) as distance_meters
      FROM tourist_profiles tp
      INNER JOIN (
        SELECT DISTINCT ON (tourist_id) 
          tourist_id, latitude, longitude, timestamp
        FROM location_pings 
        ORDER BY tourist_id, timestamp DESC
      ) lp ON tp.id = lp.tourist_id
      WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lp.longitude, lp.latitude), 4326)::geography,
        ${radiusMeters}
      )
      ORDER BY distance_meters;
    `;
  }

  async findTouristsInRiskZone(zoneId: string) {
    return this.$queryRaw`
      SELECT tp.id, tp.name, tp.did_uri, lp.latitude, lp.longitude, lp.timestamp
      FROM tourist_profiles tp
      INNER JOIN (
        SELECT DISTINCT ON (tourist_id) 
          tourist_id, latitude, longitude, timestamp, geom
        FROM location_pings 
        ORDER BY tourist_id, timestamp DESC
      ) lp ON tp.id = lp.tourist_id
      INNER JOIN risk_zones rz ON rz.id = ${zoneId}
      WHERE ST_Contains(rz.geom, lp.geom);
    `;
  }

  async getLocationClusters(
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    },
    zoom: number
  ) {
    // Dynamic clustering based on zoom level
    const clusterSize = Math.max(0.001, 0.1 / Math.pow(2, zoom - 10));

    return this.$queryRaw`
      SELECT 
        COUNT(*) as tourist_count,
        AVG(latitude) as center_lat,
        AVG(longitude) as center_lng,
        ST_Extent(geom) as bounds
      FROM (
        SELECT DISTINCT ON (tp.id) 
          tp.id, lp.latitude, lp.longitude, lp.geom
        FROM tourist_profiles tp
        INNER JOIN location_pings lp ON tp.id = lp.tourist_id
        WHERE lp.latitude BETWEEN ${bounds.south} AND ${bounds.north}
          AND lp.longitude BETWEEN ${bounds.west} AND ${bounds.east}
          AND lp.timestamp > NOW() - INTERVAL '1 hour'
        ORDER BY tp.id, lp.timestamp DESC
      ) recent_locations
      GROUP BY 
        FLOOR(latitude / ${clusterSize}) * ${clusterSize},
        FLOOR(longitude / ${clusterSize}) * ${clusterSize}
      HAVING COUNT(*) > 0;
    `;
  }
}
