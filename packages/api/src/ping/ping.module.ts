import { Module } from "@nestjs/common";
import { PingController } from "./ping.controller";
import { PingService } from "./ping.service";
import { AlertModule } from "../alert/alert.module";

@Module({
  imports: [AlertModule],
  controllers: [PingController],
  providers: [PingService],
  exports: [PingService],
})
export class PingModule {}
