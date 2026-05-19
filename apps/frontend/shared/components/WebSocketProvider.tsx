"use client";

import { createContext, useContext, useCallback, useEffect, useRef, ReactNode, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

function getWebSocketEndpoint(): string {
  if (typeof window === "undefined") {
    const serverWsUrl = BACKEND_URL.startsWith("https")
      ? BACKEND_URL.replace(/^https/, "wss")
      : BACKEND_URL.replace(/^http/, "ws");

    return `${serverWsUrl}/ws`;
  }

  const browserBackendOrigin = new URL(BACKEND_URL, window.location.origin).origin;
  const browserLocationOrigin = window.location.origin;

  if (browserBackendOrigin === browserLocationOrigin) {
    return `${window.location.origin}/ws`;
  }

  const backendWsUrl = BACKEND_URL.startsWith("https")
    ? BACKEND_URL.replace(/^https/, "wss")
    : BACKEND_URL.replace(/^http/, "ws");

  return `${backendWsUrl}/ws`;
}

export type IncomingBroadcastMessage<T = unknown> = {
  channel: string;
  event: string;
  payload: T;
  timestamp: string;
};

interface WebSocketContextType {
  subscribe: <T>(channel: string, callback: (data: IncomingBroadcastMessage<T>) => void) => void;
  unsubscribe: <T>(channel: string, callback: (data: IncomingBroadcastMessage<T>) => void) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

type SubscriberCallback = (data: IncomingBroadcastMessage<unknown>) => void;

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const subscribersRef = useRef<Map<string, Set<SubscriberCallback>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasConnectedOnceRef = useRef(false);

  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(function connect() {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const wsEndpoint = getWebSocketEndpoint();
      const ws = new WebSocket(wsEndpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        hasConnectedOnceRef.current = true;
        setIsConnected(true);
        subscribersRef.current.forEach((_, channel) => {
          ws.send(JSON.stringify({ type: "SUBSCRIBE", channel }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as IncomingBroadcastMessage<unknown>;
          const callbacks = subscribersRef.current.get(data.channel);
          if (callbacks) {
            callbacks.forEach((cb) => cb(data));
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);

        if (!hasConnectedOnceRef.current) {
          return;
        }

        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        setIsConnected(false);

        if (hasConnectedOnceRef.current) {
          console.warn(`WebSocket connection failed for ${wsEndpoint}, falling back to graceful degradation:`, error);
        }
      };
    } catch (error) {
      console.warn("Failed to create WebSocket connection:", error);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  const subscribe = <T,>(channel: string, callback: (data: IncomingBroadcastMessage<T>) => void) => {
    if (!subscribersRef.current.has(channel)) {
      subscribersRef.current.set(channel, new Set());

      const subscribeMessage = JSON.stringify({ type: "SUBSCRIBE", channel });

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(subscribeMessage);
      } else if (wsRef.current) {
        wsRef.current.addEventListener(
          "open",
          () => {
            wsRef.current?.send(subscribeMessage);
          },
          { once: true }
        );
      }
    }

    subscribersRef.current.get(channel)?.add(callback as SubscriberCallback);
  };

  const unsubscribe = <T,>(channel: string, callback: (data: IncomingBroadcastMessage<T>) => void) => {
    const callbacks = subscribersRef.current.get(channel);
    if (callbacks) {
      callbacks.delete(callback as SubscriberCallback);

      if (callbacks.size === 0) {
        subscribersRef.current.delete(channel);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "UNSUBSCRIBE", channel }));
        }
      }
    }
  };

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe, isConnected }}>{children}</WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
