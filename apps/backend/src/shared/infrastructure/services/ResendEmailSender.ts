import { Resend } from "resend";
import EmailSender from "../../../modules/users/domain/contracts/EmailSender.js";
import EmailDeliveryFailedException from "../exceptions/EmailDeliveryFailedException.js";

export default class ResendEmailSender implements EmailSender {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendVerificationEmail(email: string, userId: string, name: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL!}/verify?id=${userId}`;

    const { error } = await this.resend.emails.send({
      from: `UpQuit <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: email,
      subject: "Verify your UpQuit account",
      html: `<h1>Welcome ${name}!</h1><p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`
    });

    if (error) {
      throw new EmailDeliveryFailedException(`Email delivery failed: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: `UpQuit <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: email,
      subject: "Reset your UpQuit password",
      html: `<h1>Password Reset</h1><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 15 minutes.</p><p>If you didn't request this, please ignore this email.</p>`
    });

    if (error) {
      throw new EmailDeliveryFailedException(`Email delivery failed: ${error.message}`);
    }
  }
}
