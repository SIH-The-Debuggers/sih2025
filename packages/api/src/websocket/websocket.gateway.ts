import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },
  namespace: /^\/ws\/(ops|tourist)$/,
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      client.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      // Join appropriate rooms based on namespace and role
      const namespace = client.nsp.name;

      if (
        namespace === "/ws/ops" &&
        ["POLICE", "ADMIN"].includes(client.user.role)
      ) {
        await client.join("police-ops");
        this.logger.log(
          `Police user ${client.user.email} connected to ops namespace`
        );
      } else if (
        namespace === "/ws/tourist" &&
        client.user.role === "TOURIST"
      ) {
        await client.join(`tourist-${client.user.id}`);
        this.logger.log(
          `Tourist user ${client.user.email} connected to tourist namespace`
        );
      } else {
        client.disconnect();
        return;
      }
    } catch (error) {
      this.logger.error("Failed to authenticate WebSocket connection:", error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.logger.log(`User ${client.user.email} disconnected`);
    }
  }

  // Police Operations Namespace Events
  @SubscribeMessage("alerts:subscribe")
  handleAlertsSubscribe(@ConnectedSocket() client: AuthenticatedSocket) {
    if (
      client.nsp.name === "/ws/ops" &&
      ["POLICE", "ADMIN"].includes(client.user?.role || "")
    ) {
      client.join("alerts-feed");
      return { status: "subscribed", channel: "alerts-feed" };
    }
    return { status: "error", message: "Unauthorized" };
  }

  @SubscribeMessage("map:subscribe")
  handleMapSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { bounds?: any; zoom?: number }
  ) {
    if (
      client.nsp.name === "/ws/ops" &&
      ["POLICE", "ADMIN"].includes(client.user?.role || "")
    ) {
      client.join("map-updates");

      // Send initial map data
      this.sendMapClusters(client, data.bounds, data.zoom);

      return { status: "subscribed", channel: "map-updates" };
    }
    return { status: "error", message: "Unauthorized" };
  }

  // Tourist Namespace Events
  @SubscribeMessage("panic:start")
  handlePanicStart(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.nsp.name === "/ws/tourist" && client.user?.role === "TOURIST") {
      const sessionId = `panic-${client.user.id}-${Date.now()}`;
      client.join(sessionId);

      // Notify ops about panic session
      this.server.of("/ws/ops").to("police-ops").emit("panic:session:started", {
        sessionId,
        touristId: client.user.id,
        timestamp: new Date().toISOString(),
      });

      return { status: "started", sessionId };
    }
    return { status: "error", message: "Unauthorized" };
  }

  @SubscribeMessage("location:stream")
  handleLocationStream(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      sessionId: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
      timestamp: string;
    }
  ) {
    if (client.nsp.name === "/ws/tourist" && client.user?.role === "TOURIST") {
      // Broadcast location to ops
      this.server
        .of("/ws/ops")
        .to("police-ops")
        .emit("location:update", {
          touristId: client.user.id,
          ...data,
        });

      return { status: "transmitted" };
    }
    return { status: "error", message: "Unauthorized" };
  }

  // Broadcast methods for services to use
  broadcastToNamespace(namespace: string, event: string, data: any) {
    this.server.of(`/ws/${namespace}`).emit(event, data);
  }

  broadcastToRoom(namespace: string, room: string, event: string, data: any) {
    this.server.of(`/ws/${namespace}`).to(room).emit(event, data);
  }

  // Broadcast new alert to police
  broadcastAlert(alert: any) {
    this.server
      .of("/ws/ops")
      .to("alerts-feed")
      .emit("alerts:new", {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        tourist: {
          name: alert.tourist.name,
          nationality: alert.tourist.nationality,
        },
        location: {
          latitude: alert.latitude,
          longitude: alert.longitude,
        },
        timestamp: alert.createdAt,
      });
  }

  // Send map clusters to client
  private async sendMapClusters(
    client: AuthenticatedSocket,
    bounds?: any,
    zoom?: number
  ) {
    // This would integrate with your database service
    // For now, send mock data
    const clusters = [
      {
        id: "1",
        center: { lat: 28.6139, lng: 77.209 },
        count: 5,
        tourists: [{ id: "tourist-1", name: "John Doe", status: "safe" }],
      },
    ];

    client.emit("map:clusters", clusters);
  }

  // Send safety alert to specific tourist
  sendSafetyAlert(touristId: string, alert: any) {
    this.server
      .of("/ws/tourist")
      .to(`tourist-${touristId}`)
      .emit("safety:alert", alert);
  }

  // Send system notification
  sendSystemNotification(namespace: string, notification: any) {
    this.server
      .of(`/ws/${namespace}`)
      .emit("system:notification", notification);
  }
}
