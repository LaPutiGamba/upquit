export type AuthTokenPayload = {
  sub: string;
  userId: string;
  boardIds: string[];
};

export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
};

export default interface TokenSigner {
  signAccessToken(payload: AuthTokenPayload): string;
  signRefreshToken(payload: AuthTokenPayload): string;
  signTokenPair(payload: AuthTokenPayload): AuthTokenPair;
  verifyRefreshToken(token: string): AuthTokenPayload;
}
