export type AuthTokenPayload = {
  sub: string;
  userId: string;
  boardIds: string[];
};

export default interface TokenSigner {
  sign(payload: AuthTokenPayload): string;
}
