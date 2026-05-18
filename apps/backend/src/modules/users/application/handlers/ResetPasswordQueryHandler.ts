import UserRepository from "../../domain/contracts/UserRepository.js";
import PasswordHasher from "../../domain/contracts/PasswordHasher.js";
import PasswordResetTokenSigner from "../../infrastructure/services/PasswordResetTokenSigner.js";
import InvalidResetTokenException from "../exceptions/InvalidResetTokenException.js";
import ResetPasswordQuery from "../queries/ResetPasswordQuery.js";
import User from "../../domain/entities/User.js";
import UserResponse, { mapUserToResponse } from "../responses/UserResponse.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";

export default class ResetPasswordQueryHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly resetTokenSigner: PasswordResetTokenSigner
  ) {}

  async execute(query: ResetPasswordQuery): Promise<UserResponse> {
    let payload;
    try {
      payload = this.resetTokenSigner.verifyResetToken(query.token);
    } catch (error) {
      throw new InvalidResetTokenException("Invalid or expired password reset token");
    }

    // Find user
    const userId = new Uuid(payload.userId);
    const user = await this.userRepository.findByIdIncludingInactive(userId);

    if (!user) {
      throw new InvalidResetTokenException("Invalid or expired password reset token");
    }

    if (user.email.getValue() !== payload.email) {
      throw new InvalidResetTokenException("Invalid or expired password reset token");
    }

    const hashedPassword = await this.passwordHasher.hash(query.newPassword);

    const updatedUser = new User(
      user.id.getValue(),
      user.username,
      user.email.getValue(),
      user.displayName,
      hashedPassword,
      user.avatarUrl,
      user.emailVerified,
      user.oauthProvider,
      user.oauthId,
      user.isActive,
      user.createdAt
    );

    await this.userRepository.update(updatedUser);

    return mapUserToResponse(updatedUser);
  }
}
