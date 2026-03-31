export type AuthTokenPayload = {
  sub: string;
  userId: string;
  tenantId: string | null;
  boardIds: string[];
};

export default interface TokenSigner {
  sign(payload: AuthTokenPayload): string;
}
