import { Resend } from "resend";

export default class ResendEmailSender {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendVerificationEmail(email: string, userId: string, name: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?id=${userId}`;

    await this.resend.emails.send({
      from: "UpQuit <onboarding@resend.dev>", // TODO: Update email
      to: email,
      subject: "Verify your UpQuit account",
      html: `<h1>Welcome ${name}!</h1><p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`
    });
  }
}
