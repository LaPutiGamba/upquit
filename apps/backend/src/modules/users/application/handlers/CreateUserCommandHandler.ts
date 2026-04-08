import User from "../../domain/entities/User.js";
import Email from "../../domain/value-objects/Email.js";
import UserRepository from "../../domain/contracts/UserRepository.js";
import PasswordHasher from "../../domain/contracts/PasswordHasher.js";
import CreateUserCommand from "../commands/CreateUserCommand.js";
import UserAlreadyExistsException from "../exceptions/UserAlreadyExistsException.js";
import UserResponse, { mapUserToResponse } from "../responses/UserResponse.js";
import EventBus from "../../../../shared/domain/events/EventBus.js";
import UserCreatedEvent from "../../domain/events/UserCreatedEvent.js";

export default class CreateUserCommandHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateUserCommand): Promise<UserResponse> {
    const email = new Email(command.email);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException(command.email);
    }

    const passwordHash = command.password !== null ? await this.passwordHasher.hash(command.password) : null;

    const user = new User(
      crypto.randomUUID(),
      command.email,
      command.displayName,
      passwordHash,
      command.avatarUrl ?? null,
      false,
      command.oauthProvider ?? null,
      command.oauthId ?? null,
      true,
      new Date()
    );

    await this.userRepository.save(user);

    await this.eventBus.publish([new UserCreatedEvent(user.id.getValue(), command.email, user.displayName)]);

    return mapUserToResponse(user);
  }
}
