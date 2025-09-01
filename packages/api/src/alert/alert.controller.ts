import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AlertService } from "./alert.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("alerts")
@Controller("alerts")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post("panic")
  @Roles("TOURIST")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Create panic alert" })
  async createPanicAlert(
    @Body()
    alertDto: {
      latitude?: number;
      longitude?: number;
      message?: string;
      metadata?: any;
    },
    @Request() req: any
  ) {
    return this.alertService.createPanicAlert(req.user.profile.id, alertDto);
  }

  @Post(":id/acknowledge")
  @Roles("POLICE", "ADMIN")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Acknowledge alert" })
  async acknowledgeAlert(@Param("id") id: string, @Request() req: any) {
    return this.alertService.acknowledgeAlert(id, req.user.id);
  }

  @Post(":id/resolve")
  @Roles("POLICE", "ADMIN")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Resolve alert" })
  async resolveAlert(
    @Param("id") id: string,
    @Body() resolveDto: { resolution: string },
    @Request() req: any
  ) {
    return this.alertService.resolveAlert(
      id,
      req.user.id,
      resolveDto.resolution
    );
  }

  @Get("active")
  @Roles("POLICE", "ADMIN")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Get active alerts" })
  async getActiveAlerts(
    @Query("type") type?: string,
    @Query("severity") severity?: number,
    @Query("assignedTo") assignedTo?: string
  ) {
    return this.alertService.getActiveAlerts({
      type,
      severity,
      assignedTo,
    });
  }

  @Get("history")
  @Roles("POLICE", "ADMIN")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Get alerts history" })
  async getAlertsHistory(
    @Query("touristId") touristId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: number
  ) {
    return this.alertService.getAlertsHistory({
      touristId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
    });
  }

  @Get("my")
  @Roles("TOURIST")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Get my alerts" })
  async getMyAlerts(@Request() req: any) {
    return this.alertService.getAlertsHistory({
      touristId: req.user.profile.id,
    });
  }
}
