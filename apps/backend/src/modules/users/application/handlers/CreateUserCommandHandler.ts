import User from "../../domain/entities/User.js";
import Email from "../../domain/value-objects/Email.js";
import UserRepository from "../../domain/contracts/UserRepository.js";
import CreateUserCommand from "../commands/CreateUserCommand.js";
import UserAlreadyExistsException from "../exceptions/UserAlreadyExistsException.js";
import UserResponse, { mapUserToResponse } from "../responses/UserResponse.js";

export default class CreateUserCommandHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<UserResponse> {
    const email = new Email(command.email);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException(command.email);
    }

    const user = new User(
      crypto.randomUUID(),
      command.email,
      command.displayName,
      command.passwordHash ?? null,
      command.avatarUrl ?? null,
      false,
      command.oauthProvider ?? null,
      command.oauthId ?? null,
      true,
      new Date()
    );

    await this.userRepository.save(user);

    return mapUserToResponse(user);
  }
}
