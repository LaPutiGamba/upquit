import jwt, { SignOptions } from "jsonwebtoken";

import TokenSigner, { AuthTokenPayload } from "../../domain/contracts/TokenSigner.js";

export default class JwtTokenSigner implements TokenSigner {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string | number = "1h"
  ) {}

  sign(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as SignOptions["expiresIn"]
    });
  }
}
