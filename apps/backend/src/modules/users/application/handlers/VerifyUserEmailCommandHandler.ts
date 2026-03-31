import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import UserRepository from "../../domain/contracts/UserRepository.js";
import VerifyUserEmailCommand from "../commands/VerifyUserEmailCommand.js";
import UserNotFoundException from "../exceptions/UserNotFoundException.js";
import UserResponse, { mapUserToResponse } from "../responses/UserResponse.js";
import User from "../../domain/entities/User.js";

export default class VerifyUserEmailCommandHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: VerifyUserEmailCommand): Promise<UserResponse> {
    const userId = new Uuid(command.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    const verifiedUser = new User(
      user.id.getValue(),
      user.email.getValue(),
      user.displayName,
      user.passwordHash,
      user.avatarUrl,
      true,
      user.oauthProvider,
      user.oauthId,
      user.isActive,
      user.createdAt
    );

    await this.userRepository.update(verifiedUser);

    return mapUserToResponse(verifiedUser);
  }
}
