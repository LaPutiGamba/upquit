import jwt, { SignOptions } from "jsonwebtoken";

export type PasswordResetTokenPayload = {
  email: string;
  userId: string;
};

export default class PasswordResetTokenSigner {
  constructor(
    private readonly resetSecret: string,
    private readonly resetExpiresIn: string | number = "15m"
  ) {}

  signResetToken(payload: PasswordResetTokenPayload): string {
    return jwt.sign(payload, this.resetSecret, {
      expiresIn: this.resetExpiresIn as SignOptions["expiresIn"]
    });
  }

  verifyResetToken(token: string): PasswordResetTokenPayload {
    return jwt.verify(token, this.resetSecret) as PasswordResetTokenPayload;
  }
}
