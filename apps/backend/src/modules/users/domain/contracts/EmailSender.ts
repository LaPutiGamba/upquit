export default interface EmailSender {
  sendVerificationEmail(email: string, userId: string, name: string, locale?: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetUrl: string, locale?: string): Promise<void>;
}
