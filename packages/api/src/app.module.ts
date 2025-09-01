import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

// Core modules
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";

// Feature modules
import { DtidModule } from "./dtid/dtid.module";
import { GeoModule } from "./geo/geo.module";
import { PingModule } from "./ping/ping.module";
import { AlertModule } from "./alert/alert.module";
import { CaseModule } from "./case/case.module";
import { NotifyModule } from "./notify/notify.module";
import { UnitsModule } from "./units/units.module";
import { UsersModule } from "./users/users.module";

// WebSocket module
import { WebsocketModule } from "./websocket/websocket.module";

// Queue module
import { QueueModule } from "./queue/queue.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Core modules
    DatabaseModule,
    AuthModule,
    QueueModule,
    WebsocketModule,

    // Feature modules
    DtidModule,
    GeoModule,
    PingModule,
    AlertModule,
    CaseModule,
    NotifyModule,
    UnitsModule,
    UsersModule,
  ],
})
export class AppModule {}
