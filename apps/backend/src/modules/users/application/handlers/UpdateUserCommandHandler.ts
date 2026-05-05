import User from "../../domain/entities/User.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import UserRepository from "../../domain/contracts/UserRepository.js";
import UpdateUserCommand from "../commands/UpdateUserCommand.js";
import UserNotFoundException from "../exceptions/UserNotFoundException.js";
import UserResponse, { mapUserToResponse } from "../responses/UserResponse.js";
import UsernameAlreadyExistsException from "../exceptions/UsernameAlreadyExistsException.js";
import Username from "../../domain/value-objects/Username.js";

export default class UpdateUserCommandHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdateUserCommand): Promise<UserResponse> {
    const userId = new Uuid(command.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    const username = command.username !== undefined ? new Username(command.username).getValue() : user.username;

    if (username !== user.username) {
      const existingByUsername = await this.userRepository.findByUsernameIncludingInactive(username);
      if (existingByUsername && existingByUsername.id.getValue() !== user.id.getValue()) {
        throw new UsernameAlreadyExistsException(username);
      }
    }

    const updatedUser = new User(
      user.id.getValue(),
      username,
      user.email.getValue(),
      command.displayName ?? user.displayName,
      user.passwordHash,
      command.avatarUrl !== undefined ? command.avatarUrl : user.avatarUrl,
      command.emailVerified ?? user.emailVerified,
      user.oauthProvider,
      user.oauthId,
      user.isActive,
      user.createdAt
    );

    await this.userRepository.update(updatedUser);

    return mapUserToResponse(updatedUser);
  }
}
