import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health.controller";

@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
