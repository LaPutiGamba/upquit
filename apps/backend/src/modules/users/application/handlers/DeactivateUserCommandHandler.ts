import User from "../../domain/entities/User.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import UserRepository from "../../domain/contracts/UserRepository.js";
import DeactivateUserCommand from "../commands/DeactivateUserCommand.js";
import UserNotFoundException from "../exceptions/UserNotFoundException.js";
import UserAlreadyDeactivatedException from "../exceptions/UserAlreadyDeactivatedException.js";
import UserResponse, { mapUserToResponse } from "../responses/UserResponse.js";

export default class DeactivateUserCommandHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeactivateUserCommand): Promise<UserResponse> {
    const userId = new Uuid(command.userId);
    const user = await this.userRepository.findByIdIncludingInactive(userId);

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    if (!user.isActive) {
      throw new UserAlreadyDeactivatedException(command.userId);
    }

    const deactivatedUser = new User(
      user.id.getValue(),
      user.email.getValue(),
      user.displayName,
      user.passwordHash,
      user.avatarUrl,
      user.emailVerified,
      user.oauthProvider,
      user.oauthId,
      false,
      user.createdAt
    );

    await this.userRepository.update(deactivatedUser);

    return mapUserToResponse(deactivatedUser);
  }
}
