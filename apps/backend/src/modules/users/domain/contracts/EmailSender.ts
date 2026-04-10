export default interface EmailSender {
  sendVerificationEmail(email: string, userId: string, name: string): Promise<void>;
}
