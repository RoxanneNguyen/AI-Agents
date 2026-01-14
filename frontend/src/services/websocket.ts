/**
 * WebSocket service for real-time communication
 */

import type { WSMessage, ExecutionStep, Artifact } from "../types";

export type WSEventHandler = {
  onConnected?: (sessionId: string) => void;
  onStart?: () => void;
  onStep?: (step: ExecutionStep) => void;
  onToken?: (token: string) => void;
  onArtifact?: (artifact: Artifact) => void;
  onComplete?: (data: { success: boolean; duration_ms: number }) => void;
  onError?: (message: string) => void;
  onDisconnect?: () => void;
};

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: WSEventHandler = {};
  private sessionId: string | null = null;
  private messageQueue: string[] = [];

  /**
   * Connect to the WebSocket server
   */
  connect(sessionId: string, handlers: WSEventHandler = {}): void {
    this.sessionId = sessionId;
    this.handlers = handlers;

    const wsUrl = `ws://${window.location.host}/ws/chat/${sessionId}`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error("WebSocket connection error:", error);
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;

      // Send queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) this.ws?.send(message);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected");
      this.handlers.onDisconnect?.();
      this.handleReconnect();
    };
  }

  private handleMessage(message: WSMessage): void {
    switch (message.type) {
      case "connected":
        this.handlers.onConnected?.(message.session_id || "");
        break;

      case "start":
        this.handlers.onStart?.();
        break;

      case "step":
        if (message.data) {
          const stepData = message.data as { step: ExecutionStep };
          this.handlers.onStep?.(stepData.step);
        }
        break;

      case "token":
        if (message.data) {
          const tokenData = message.data as { content: string };
          this.handlers.onToken?.(tokenData.content);
        }
        break;

      case "artifact":
        if (message.data) {
          const artifactData = message.data as { artifact: Artifact };
          this.handlers.onArtifact?.(artifactData.artifact);
        }
        break;

      case "complete":
        if (message.data) {
          const completeData = message.data as {
            success: boolean;
            total_duration_ms: number;
          };
          this.handlers.onComplete?.({
            success: completeData.success,
            duration_ms: completeData.total_duration_ms,
          });
        }
        break;

      case "error":
        this.handlers.onError?.(message.message || "Unknown error");
        break;

      case "pong":
        // Heartbeat response
        break;

      default:
        console.log("Unknown message type:", message.type);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      if (this.sessionId) {
        this.connect(this.sessionId, this.handlers);
      }
    }, delay);
  }

  /**
   * Send a message through WebSocket
   */
  sendMessage(content: string): void {
    const message = JSON.stringify({
      type: "message",
      content,
    });

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue the message for later
      this.messageQueue.push(message);
    }
  }

  /**
   * Send a ping to keep connection alive
   */
  ping(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "ping",
          timestamp: Date.now(),
        })
      );
    }
  }

  /**
   * Cancel current operation
   */
  cancel(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "cancel" }));
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.sessionId = null;
    this.handlers = {};
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService();
