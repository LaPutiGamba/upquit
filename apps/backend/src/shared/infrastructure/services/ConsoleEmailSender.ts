import EmailSender from "../../../modules/users/domain/contracts/EmailSender.js";

export default class ConsoleEmailSender implements EmailSender {
  async sendVerificationEmail(email: string, userId: string, name: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL!}/verify?id=${userId}`;

    console.log(`
=========================================
📧 EMAIL SENT (CONSOLE FALLBACK)
=========================================
To: ${email}
Subject: Verify your UpQuit account
Content:
Welcome ${name}!
Please verify your email by clicking here:
${verificationUrl}
=========================================
    `);
  }
}
