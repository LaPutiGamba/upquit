export type AuthTokenPayload = {
  sub: string;
  userId: string;
  boardIds: string[];
};

export function decodeJwtPayload<T extends Record<string, unknown> = AuthTokenPayload>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=");

    const decodedPayload = decodeURIComponent(
      atob(paddedPayload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(decodedPayload) as T;
  } catch {
    return null;
  }
}
