"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { requestService, RequestResponse } from "@/features/requests/services/requestService";
import { UnauthorizedError } from "@/shared/lib/apiClient";

interface UseRequestDetailPageResult {
  board: BoardResponse | null;
  request: RequestResponse | null;
  loading: boolean;
  notFound: boolean;
}

export function useRequestDetailPage(slug: string, id: string): UseRequestDetailPageResult {
  const router = useRouter();

  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [request, setRequest] = useState<RequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadRequestPage = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const currentBoard = await boardService.getBoardBySlug(slug);

        if (cancelled) {
          return;
        }

        setBoard(currentBoard);

        const currentRequest = await requestService.getRequestById(id, currentBoard.id);

        if (cancelled) {
          return;
        }

        setRequest(currentRequest);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof UnauthorizedError) {
          router.replace("/login");
          return;
        }

        setNotFound(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRequestPage();

    return () => {
      cancelled = true;
    };
  }, [id, router, slug]);

  return { board, request, loading, notFound };
}
