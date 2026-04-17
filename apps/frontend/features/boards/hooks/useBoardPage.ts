"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { requestService, RequestResponse } from "@/features/requests/services/requestService";
import { UnauthorizedError } from "@/shared/lib/apiClient";
import { formatLocalizedDateTime } from "@/shared/lib/date";

interface UseBoardPageResult {
  board: BoardResponse | null;
  requests: RequestResponse[];
  latestRequestDate: string | null;
  loading: boolean;
  notFound: boolean;
}

export function useBoardPage(slug: string): UseBoardPageResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isRequestsTab = searchParams.get("tab") === "requests";

  const [board, setBoard] = useState<BoardResponse | null>(null);
  const [requests, setRequests] = useState<RequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const requestsSortedByDate = useMemo(() => {
    return [...requests].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return bTime - aTime;
    });
  }, [requests]);

  const latestRequestDate = useMemo(() => {
    const latest = requestsSortedByDate[0];

    if (!latest?.createdAt) {
      return null;
    }

    return formatLocalizedDateTime(latest.createdAt, locale);
  }, [locale, requestsSortedByDate]);

  useEffect(() => {
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

    void loadBoardPage();

    return () => {
      cancelled = true;
    };
  }, [isRequestsTab, router, slug]);

  return { board, requests: requestsSortedByDate, latestRequestDate, loading, notFound };
}
