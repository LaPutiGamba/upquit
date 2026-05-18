import EmailSender from "../../../modules/users/domain/contracts/EmailSender.js";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export default class ConsoleEmailSender implements EmailSender {
  async sendVerificationEmail(email: string, userId: string, name: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL!}/verify?id=${userId}`;

    logger.info(
      {
        email,
        userId,
        verificationUrl
      },
      "📧 EMAIL SENT (CONSOLE FALLBACK - Development Mode)"
    );
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    logger.info(
      {
        email,
        resetUrl
      },
      "📧 PASSWORD RESET EMAIL SENT (CONSOLE FALLBACK - Development Mode)"
    );
  }
}
