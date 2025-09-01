import { io, Socket } from "socket.io-client";
import { WS_URL, WS_EVENTS } from "./config";
import type { WSLocationUpdate, WSPanicAlert, WSAlertUpdate } from "./types";

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(`${WS_URL}/ws/tourist`, {
      auth: { token },
      transports: ["websocket"],
      timeout: 10000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.handleReconnect();
    });

    // Location acknowledgment
    this.socket.on(WS_EVENTS.LOCATION_ACKNOWLEDGED, (data) => {
      this.emit("locationAcknowledged", data);
    });

    // Panic alert acknowledgment
    this.socket.on(WS_EVENTS.PANIC_ACKNOWLEDGED, (data) => {
      this.emit("panicAcknowledged", data);
    });

    // Alert updates
    this.socket.on(WS_EVENTS.ALERT_UPDATE, (data: WSAlertUpdate) => {
      this.emit("alertUpdate", data);
    });

    // Emergency broadcasts
    this.socket.on(WS_EVENTS.EMERGENCY_BROADCAST, (data) => {
      this.emit("emergencyBroadcast", data);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.emit("reconnectFailed");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
      if (this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  // Send location update
  sendLocationUpdate(data: WSLocationUpdate): void {
    if (this.socket?.connected) {
      this.socket.emit(WS_EVENTS.LOCATION_UPDATE, data);
    }
  }

  // Send panic alert
  sendPanicAlert(data: WSPanicAlert): void {
    if (this.socket?.connected) {
      this.socket.emit(WS_EVENTS.PANIC_ALERT, data);
    }
  }

  // Event emitter functionality
  private listeners: { [event: string]: Array<(data: any) => void> } = {};

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  private emit(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  // Connection status
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get connectionId(): string | undefined {
    return this.socket?.id;
  }
}

// Singleton instance
export const wsService = new WebSocketService();

// React hook for WebSocket connection
export function useWebSocket() {
  const connect = (token: string) => wsService.connect(token);
  const disconnect = () => wsService.disconnect();

  const sendLocationUpdate = (data: WSLocationUpdate) =>
    wsService.sendLocationUpdate(data);

  const sendPanicAlert = (data: WSPanicAlert) => wsService.sendPanicAlert(data);

  const on = (event: string, callback: (data: any) => void) =>
    wsService.on(event, callback);

  const off = (event: string, callback: (data: any) => void) =>
    wsService.off(event, callback);

  return {
    connect,
    disconnect,
    sendLocationUpdate,
    sendPanicAlert,
    on,
    off,
    isConnected: wsService.isConnected,
    connectionId: wsService.connectionId,
  };
}
