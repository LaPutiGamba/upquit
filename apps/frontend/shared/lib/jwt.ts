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

    return JSON.parse(atob(paddedPayload)) as T;
  } catch {
    return null;
  }
}
