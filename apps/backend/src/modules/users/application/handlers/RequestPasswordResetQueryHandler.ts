import UserRepository from "../../domain/contracts/UserRepository.js";
import EmailSender from "../../domain/contracts/EmailSender.js";
import PasswordResetTokenSigner from "../../infrastructure/services/PasswordResetTokenSigner.js";
import Email from "../../domain/value-objects/Email.js";
import RequestPasswordResetQuery from "../queries/RequestPasswordResetQuery.js";

export default class RequestPasswordResetQueryHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailSender: EmailSender,
    private readonly resetTokenSigner: PasswordResetTokenSigner
  ) {}

  async execute(query: RequestPasswordResetQuery): Promise<{ message: string }> {
    const email = new Email(query.email);
    const user = await this.userRepository.findByEmailIncludingInactive(email);

    if (!user) {
      return { message: "If an account exists with this email, a password reset link has been sent." };
    }

    const resetToken = this.resetTokenSigner.signResetToken({
      email: user.email.getValue(),
      userId: user.id.getValue()
    });

    const resetUrl = `${process.env.FRONTEND_URL!}/reset-password?token=${resetToken}`;

    await this.emailSender.sendPasswordResetEmail(user.email.getValue(), resetUrl);

    return { message: "If an account exists with this email, a password reset link has been sent." };
  }
}
