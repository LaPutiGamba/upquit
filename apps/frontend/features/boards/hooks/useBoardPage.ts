"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { requestService, RequestResponse } from "@/features/requests/services/requestService";
import { UnauthorizedError } from "@/shared/lib/apiClient";
import { useChannel, type IncomingBroadcastMessage } from "@/shared/hooks/useChannel";
import { useAuth } from "@/shared/components/AuthProvider";

interface UseBoardPageResult {
  board: BoardResponse | null;
  requests: RequestResponse[];
  latestRequestDate: string | null;
  loading: boolean;
  notFound: boolean;
  addRequest: (request: RequestResponse) => void;
}

type RequestRealtimeMessagePayload =
  | {
      boardId: string;
      request: RequestResponse;
    }
  | {
      boardId: string;
      requestId: string;
      voteId: string;
      userId: string;
      action: "created" | "deleted";
      voteCount: number | null;
    };

export function useBoardPage(slug: string, isRequestsTab: boolean): UseBoardPageResult {
  const router = useRouter();
  const { isAuthLoading } = useAuth();

  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [requests, setRequests] = useState<RequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const addRequest = useCallback((request: RequestResponse) => {
    setRequests((prev) => {
      const exists = prev.some((r) => r.id === request.id);
      if (exists) {
        return prev;
      }

      return [request, ...prev];
    });
  }, []);

  const requestsSortedByDate = useMemo(() => {
    return requests.toSorted((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return bTime - aTime;
    });
  }, [requests]);

  const latestRequestDate = useMemo(() => {
    const latest = requestsSortedByDate[0];
    if (!latest?.createdAt) return null;

    const date = latest.createdAt;
    return typeof date === "string" ? date : date.toISOString();
  }, [requestsSortedByDate]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let cancelled = false;

    const loadBoardPage = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const currentBoard = await boardService.getBoardBySlug(slug);

        if (cancelled) {
          return;
        }

        setBoard(currentBoard);

        if (isRequestsTab) {
          const boardRequests = await requestService.getRequestsByBoardId(currentBoard.id).catch(() => []);

          if (cancelled) {
            return;
          }

          setRequests(boardRequests);
        } else {
          setRequests([]);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof UnauthorizedError) {
          window.location.replace("/login");
          return;
        }

        setNotFound(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBoardPage();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isRequestsTab, router, slug]);

  const handleBoardChannelMessage = useCallback(
    (message: IncomingBroadcastMessage<RequestRealtimeMessagePayload>) => {
      const payload = message.payload;

      if (message.event === "RequestCreated" && "request" in payload) {
        addRequest(payload.request);
        return;
      }

      if (message.event === "RequestUpdated") {
        if ("request" in payload) {
          const nextRequest = payload.request;
          setRequests((prev) => prev.map((item) => (item.id === nextRequest.id ? nextRequest : item)));
          return;
        }

        if ("requestId" in payload) {
          setRequests((prev) =>
            prev.map((item) =>
              item.id === payload.requestId
                ? {
                    ...item,
                    voteCount: payload.voteCount ?? 0
                  }
                : item
            )
          );
        }
      }
    },
    [addRequest]
  );

  useChannel<RequestRealtimeMessagePayload>(board ? `request.${board.id}` : null, handleBoardChannelMessage);

  return { board, requests: requestsSortedByDate, latestRequestDate, loading, notFound, addRequest };
}
