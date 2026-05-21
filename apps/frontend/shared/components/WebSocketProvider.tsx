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
  const isUnmountingRef = useRef(false);

  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(function connect() {
    if (isUnmountingRef.current) return;

    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const wsEndpoint = getWebSocketEndpoint();
      const ws = new WebSocket(wsEndpoint);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmountingRef.current) return;
        hasConnectedOnceRef.current = true;
        setIsConnected(true);
        subscribersRef.current.forEach((_, channel) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "SUBSCRIBE", channel }));
          }
        });
      };

      ws.onmessage = (event) => {
        if (isUnmountingRef.current) return;
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

      ws.onclose = (event) => {
        setIsConnected(false);

        if (isUnmountingRef.current) return;

        if (!hasConnectedOnceRef.current) {
          return;
        }

        if (event.wasClean) {
          return;
        }

        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        if (isUnmountingRef.current) return;
        setIsConnected(false);
      };
    } catch (error) {
      if (!isUnmountingRef.current) {
        console.warn("Failed to create WebSocket connection:", error);
      }
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    isUnmountingRef.current = false;
    
    const shouldConnect = () => {
      return !isUnmountingRef.current && document.visibilityState === "visible";
    };
    
    const connectTimer = setTimeout(() => {
      if (shouldConnect()) {
        connect();
      }
    }, 200);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isUnmountingRef.current && !wsRef.current) {
        connect();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      isUnmountingRef.current = true;
      clearTimeout(connectTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      const ws = wsRef.current;
      if (ws) {
        wsRef.current = null;
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          try {
            ws.close(1000, "Navigation");
          } catch {
            // Ignore errors during cleanup
          }
        }
      }
    };
  }, [connect]);

  const subscribe = <T,>(channel: string, callback: (data: IncomingBroadcastMessage<T>) => void) => {
    if (isUnmountingRef.current) return;

    if (!subscribersRef.current.has(channel)) {
      subscribersRef.current.set(channel, new Set());

      const subscribeMessage = JSON.stringify({ type: "SUBSCRIBE", channel });

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(subscribeMessage);
      } else if (wsRef.current) {
        wsRef.current.addEventListener(
          "open",
          () => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(subscribeMessage);
            }
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
