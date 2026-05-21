import { Resend } from "resend";
import EmailSender from "../../../modules/users/domain/contracts/EmailSender.js";
import EmailDeliveryFailedException from "../exceptions/EmailDeliveryFailedException.js";
import WelcomeEmail from "../emails/WelcomeEmail.js";
import PasswordResetEmail from "../emails/PasswordResetEmail.js";

export default class ResendEmailSender implements EmailSender {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendVerificationEmail(email: string, userId: string, name: string, locale = "en"): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL!}/verify?id=${userId}`;

    const { error } = await this.resend.emails.send({
      from: `UpQuit <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: email,
      subject: "Verify your UpQuit account",
      react: <WelcomeEmail userName={name} verificationUrl={verificationUrl} locale={locale} />,
    });

    if (error) {
      throw new EmailDeliveryFailedException(`Email delivery failed: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string, locale = "en"): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: `UpQuit <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: email,
      subject: "Reset your UpQuit password",
      react: <PasswordResetEmail resetUrl={resetUrl} locale={locale} />,
    });

    if (error) {
      throw new EmailDeliveryFailedException(`Email delivery failed: ${error.message}`);
    }
  }
}
