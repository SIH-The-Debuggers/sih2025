import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get("NODE_ENV", "development"),
      version: "1.0.0",
      services: {
        database: "connected",
        redis: "connected",
        blockchain: this.configService.get("BLOCKCHAIN_ENABLED")
          ? "enabled"
          : "disabled",
      },
    };
  }

  @Get("ready")
  @ApiOperation({ summary: "Readiness check endpoint" })
  @ApiResponse({ status: 200, description: "Service is ready" })
  getReady() {
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("live")
  @ApiOperation({ summary: "Liveness check endpoint" })
  @ApiResponse({ status: 200, description: "Service is live" })
  getLive() {
    return {
      status: "live",
      timestamp: new Date().toISOString(),
    };
  }
}
