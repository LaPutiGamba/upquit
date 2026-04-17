"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { boardService, type BoardResponse } from "@/features/boards/services/boardService";
import { authService, type UserResponse } from "@/features/authentication/services/authService";
import { decodeJwtPayload } from "@/shared/lib/jwt";
import { getAccessToken } from "@/shared/lib/apiClient";
import { usePathname } from "@/localization/i18n/routing";

type AuthContextValue = {
  user: UserResponse | null;
  boards: BoardResponse[];
  isAuthLoading: boolean;
  setUser: (nextUser: UserResponse | null) => void;
  refreshBoards: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
};

const AUTH_PATHS = ["/login", "/register", "/verify", "/verify-email"];
const SHELLLESS_PATHS = ["/"];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isShelllessPath(pathname: string): boolean {
  return SHELLLESS_PATHS.includes(pathname);
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [boards, setBoards] = useState<BoardResponse[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const shouldSkipAuthBootstrap = isAuthPath(pathname) || isShelllessPath(pathname);

  const refreshBoards = useCallback(async () => {
    const nextBoards = await boardService.getMyBoards();
    setBoards(nextBoards);
  }, []);

  const refreshAuthState = useCallback(async () => {
    let token = getAccessToken();

    if (!token) {
      try {
        const refreshed = await authService.refreshSession();
        token = refreshed.accessToken;
      } catch {
        token = null;
      }
    }

    if (!token) {
      setUser(null);
      setBoards([]);
      return;
    }

    const payload = decodeJwtPayload<{ userId?: string; sub?: string }>(token);
    const userId = payload?.userId ?? payload?.sub;

    if (!userId) {
      setUser(null);
      setBoards([]);
      return;
    }

    try {
      const [profile, userBoards] = await Promise.all([
        authService.getUserProfile(userId, token),
        boardService.getMyBoards(token)
      ]);

      setUser(profile);
      setBoards(userBoards);
    } catch {
      setUser(null);
      setBoards([]);
    }
  }, []);

  useEffect(() => {
    if (shouldSkipAuthBootstrap) {
      return;
    }

    let isCancelled = false;

    const bootstrap = async () => {
      setIsAuthLoading(true);
      try {
        await refreshAuthState();
      } finally {
        if (!isCancelled) {
          setIsAuthLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isCancelled = true;
    };
  }, [refreshAuthState, shouldSkipAuthBootstrap]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      boards,
      isAuthLoading,
      setUser,
      refreshBoards,
      refreshAuthState
    }),
    [boards, isAuthLoading, refreshAuthState, refreshBoards, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
