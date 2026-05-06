"use client";

import { useEffect, useRef } from "react";
import { useWebSocket, IncomingBroadcastMessage } from "../components/WebSocketProvider";

export function useChannel<T = unknown>(
  channel: string | null,
  onMessage: (message: IncomingBroadcastMessage<T>) => void
) {
  const { subscribe, unsubscribe } = useWebSocket();

  const savedCallback = useRef(onMessage);
  useEffect(() => {
    savedCallback.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!channel) return;

    const callback = (data: IncomingBroadcastMessage<T>) => {
      savedCallback.current(data);
    };

    subscribe<T>(channel, callback);

    return () => {
      unsubscribe<T>(channel, callback);
    };
  }, [channel, onMessage, subscribe, unsubscribe]);
}
