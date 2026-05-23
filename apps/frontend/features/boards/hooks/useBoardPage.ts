"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { requestService, RequestResponse, GetRequestsFilters } from "@/features/requests/services/requestService";
import { UnauthorizedError } from "@/shared/lib/apiClient";
import { useChannel, type IncomingBroadcastMessage } from "@/shared/hooks/useChannel";
import { useAuth } from "@/shared/components/AuthProvider";
import { unwrapBroadcastPayload } from "@/shared/lib/realtime";

interface UseBoardPageResult {
  board: BoardResponse | null;
  requests: RequestResponse[];
  latestRequestDate: string | null;
  loading: boolean;
  notFound: boolean;
  addRequest: (request: RequestResponse) => void;
  refetchRequests: () => void;
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

export function useBoardPage(slug: string, isRequestsTab: boolean, filters?: GetRequestsFilters): UseBoardPageResult {
  const router = useRouter();
  const { isAuthLoading } = useAuth();
  const sortBy = filters?.sortBy ?? "newest";

  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [requests, setRequests] = useState<RequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  const filtersKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);

  const addRequest = useCallback(
    (request: RequestResponse) => {
      setRequests((prev) => {
        const exists = prev.some((r) => r.id === request.id);
        if (exists) {
          return prev;
        }

        const next = [...prev, request];

        return next.toSorted((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

          switch (sortBy) {
            case "oldest":
              return aTime - bTime;
            case "recently_updated":
            case "newest":
            default:
              return bTime - aTime;
          }
        });
      });
    },
    [sortBy]
  );

  const latestRequestDate = useMemo(() => {
    let latestTime = 0;
    let latestDate: string | null = null;

    for (const request of requests) {
      if (!request.createdAt) {
        continue;
      }

      const requestTime = new Date(request.createdAt).getTime();
      if (requestTime >= latestTime) {
        latestTime = requestTime;
        latestDate = typeof request.createdAt === "string" ? request.createdAt : request.createdAt.toISOString();
      }
    }

    return latestDate;
  }, [requests]);

  const refetchRequests = useCallback(() => {
    setRefetchKey((k) => k + 1);
  }, []);

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
          const boardRequests = await requestService.getRequestsByBoardId(currentBoard.id, filters).catch(() => []);

          if (!cancelled) {
            setRequests(boardRequests);
          }
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
  }, [isAuthLoading, isRequestsTab, router, slug, filters, filtersKey, refetchKey]);

  const handleBoardChannelMessage = useCallback(
    (message: IncomingBroadcastMessage<RequestRealtimeMessagePayload>) => {
      const payload = unwrapBroadcastPayload(message.payload);

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

  return { board, requests, latestRequestDate, loading, notFound, addRequest, refetchRequests };
}
