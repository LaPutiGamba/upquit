"use client";

import { useEffect, useReducer } from "react";
import { redirect } from "next/navigation";

import { boardService, BoardResponse } from "@/features/boards/services/boardService";
import { requestService, RequestResponse } from "@/features/requests/services/requestService";
import { UnauthorizedError } from "@/shared/lib/apiClient";

interface RequestDetailPageState {
  board: BoardResponse | null;
  request: RequestResponse | null;
  loading: boolean;
  notFound: boolean;
}

type RequestDetailPageAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: { board: BoardResponse; request: RequestResponse } }
  | { type: "LOAD_ERROR" }
  | { type: "RESET" };

function requestDetailPageReducer(state: RequestDetailPageState, action: RequestDetailPageAction): RequestDetailPageState {
  switch (action.type) {
    case "LOAD_START":
      return { board: null, request: null, loading: true, notFound: false };
    case "LOAD_SUCCESS":
      return { board: action.payload.board, request: action.payload.request, loading: false, notFound: false };
    case "LOAD_ERROR":
      return { board: null, request: null, loading: false, notFound: true };
    case "RESET":
      return { board: null, request: null, loading: true, notFound: false };
    default:
      return state;
  }
}

interface UseRequestDetailPageResult {
  board: BoardResponse | null;
  request: RequestResponse | null;
  loading: boolean;
  notFound: boolean;
}

export function useRequestDetailPage(slug: string, id: string): UseRequestDetailPageResult {
  const [state, dispatch] = useReducer(requestDetailPageReducer, {
    board: null,
    request: null,
    loading: true,
    notFound: false
  });

  useEffect(() => {
    let cancelled = false;

    const loadRequestPage = async () => {
      dispatch({ type: "RESET" });

      try {
        const currentBoard = await boardService.getBoardBySlug(slug);

        if (cancelled) {
          return;
        }

        const currentRequest = await requestService.getRequestById(id, currentBoard.id);

        if (cancelled) {
          return;
        }

        dispatch({ type: "LOAD_SUCCESS", payload: { board: currentBoard, request: currentRequest } });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof UnauthorizedError) {
          redirect("/login");
        }

        dispatch({ type: "LOAD_ERROR" });
      }
    };

    void loadRequestPage();

    return () => {
      cancelled = true;
    };
  }, [id, slug]);

  return { board: state.board, request: state.request, loading: state.loading, notFound: state.notFound };
}
