import jwt, { SignOptions } from "jsonwebtoken";

import TokenSigner, { AuthTokenPair, AuthTokenPayload } from "../../domain/contracts/TokenSigner.js";

export default class JwtTokenSigner implements TokenSigner {
  constructor(
    private readonly accessSecret: string,
    private readonly refreshSecret: string,
    private readonly accessExpiresIn: string | number = "15m",
    private readonly refreshExpiresIn: string | number = "7d"
  ) {}

  signAccessToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn as SignOptions["expiresIn"]
    });
  }

  signRefreshToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn as SignOptions["expiresIn"]
    });
  }

  signTokenPair(payload: AuthTokenPayload): AuthTokenPair {
    return {
      accessToken: this.signAccessToken(payload),
      refreshToken: this.signRefreshToken(payload)
    };
  }

  verifyRefreshToken(token: string): AuthTokenPayload {
    return jwt.verify(token, this.refreshSecret) as AuthTokenPayload;
  }
}
