import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PingService } from "./ping.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("ping")
@Controller("ping")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PingController {
  constructor(private readonly pingService: PingService) {}

  @Post("batch")
  @Roles("TOURIST")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Submit batch location pings" })
  async submitBatchPings(
    @Body()
    pingsDto: {
      pings: Array<{
        latitude: number;
        longitude: number;
        altitude?: number;
        speed?: number;
        accuracy?: number;
        bearing?: number;
        timestamp: string;
      }>;
    },
    @Request() req: any
  ) {
    return this.pingService.processBatchPings(
      req.user.profile.id,
      pingsDto.pings
    );
  }

  @Get("last-location")
  @Roles("TOURIST", "POLICE", "ADMIN")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Get last known location" })
  async getLastLocation(
    @Query("touristId") touristId?: string,
    @Request() req: any
  ) {
    const targetTouristId = touristId || req.user.profile.id;

    // Tourists can only see their own location
    if (
      req.user.role === "TOURIST" &&
      targetTouristId !== req.user.profile.id
    ) {
      throw new Error("Access denied");
    }

    return this.pingService.getLastKnownLocation(targetTouristId);
  }

  @Get("history")
  @Roles("TOURIST", "POLICE", "ADMIN")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Get location history" })
  async getLocationHistory(
    @Query("touristId") touristId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: number,
    @Request() req: any
  ) {
    const targetTouristId = touristId || req.user.profile.id;

    // Tourists can only see their own history
    if (
      req.user.role === "TOURIST" &&
      targetTouristId !== req.user.profile.id
    ) {
      throw new Error("Access denied");
    }

    return this.pingService.getLocationHistory(targetTouristId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
    });
  }
}
