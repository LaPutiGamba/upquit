"use client";

import { useEffect } from "react";
import { useWebSocket, IncomingBroadcastMessage } from "../components/WebSocketProvider";

export function useChannel<T = unknown>(
  channel: string | null,
  onMessage: (message: IncomingBroadcastMessage<T>) => void
) {
  const { subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    if (!channel) return;

    const callback = (data: IncomingBroadcastMessage<T>) => {
      onMessage(data);
    };

    subscribe<T>(channel, callback);

    return () => {
      unsubscribe<T>(channel, callback);
    };
  }, [channel, onMessage, subscribe, unsubscribe]);
}
