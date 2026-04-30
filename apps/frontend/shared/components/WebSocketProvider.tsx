"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const WS_URL = BACKEND_URL.startsWith("https")
  ? BACKEND_URL.replace(/^https/, "wss")
  : BACKEND_URL.replace(/^http/, "ws");

export type IncomingBroadcastMessage<T = unknown> = {
  channel: string;
  event: string;
  payload: T;
  timestamp: string;
};

interface WebSocketContextType {
  subscribe: <T>(channel: string, callback: (data: IncomingBroadcastMessage<T>) => void) => void;
  unsubscribe: <T>(channel: string, callback: (data: IncomingBroadcastMessage<T>) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

type SubscriberCallback = (data: IncomingBroadcastMessage<unknown>) => void;

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);

  const subscribersRef = useRef<Map<string, Set<SubscriberCallback>>>(new Map());

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

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

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

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

  return <WebSocketContext.Provider value={{ subscribe, unsubscribe }}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
