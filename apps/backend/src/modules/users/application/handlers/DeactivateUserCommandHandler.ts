import User from "../../domain/entities/User.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import UserRepository from "../../domain/contracts/UserRepository.js";
import DeactivateUserCommand from "../commands/DeactivateUserCommand.js";
import UserNotFoundException from "../exceptions/UserNotFoundException.js";
import UserAlreadyDeactivatedException from "../exceptions/UserAlreadyDeactivatedException.js";
import UserResponse, { mapUserToResponse } from "../responses/UserResponse.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import Board from "../../../boards/domain/entities/Board.js";

export default class DeactivateUserCommandHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly boardRepository: BoardRepository
  ) {}

  async execute(command: DeactivateUserCommand): Promise<UserResponse> {
    const userId = new Uuid(command.userId);
    const user = await this.userRepository.findByIdIncludingInactive(userId);

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    if (!user.isActive) {
      throw new UserAlreadyDeactivatedException(command.userId);
    }

    const ownedBoards = await this.boardRepository.findByOwnerId(userId);

    if (ownedBoards.length > 0) {
      const adminUser = await this.userRepository.findFirstActiveUser(userId);

      if (adminUser) {
        for (const board of ownedBoards) {
          const transferredBoard = new Board(
            board.id.getValue(),
            board.slug.getValue(),
            board.name,
            board.description,
            board.logoUrl,
            board.primaryColor!.getValue(),
            board.isPublic,
            board.allowAnonymousVotes,
            board.giveToGetEnabled,
            board.giveToGetVotesReq,
            board.giveToGetCommentsReq,
            adminUser,
            board.createdAt
          );
          await this.boardRepository.update(transferredBoard);
        }
      } else {
        for (const board of ownedBoards) {
          await this.boardRepository.delete(board.id.getValue());
        }
      }
    }

    const deactivatedUser = new User(
      user.id.getValue(),
      user.username,
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
