import { Module } from "@nestjs/common";
import { AlertController } from "./alert.controller";
import { AlertService } from "./alert.service";
import { NotifyModule } from "../notify/notify.module";
import { WebsocketModule } from "../websocket/websocket.module";

@Module({
  imports: [NotifyModule, WebsocketModule],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
