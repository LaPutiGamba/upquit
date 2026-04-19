import Board from "../../domain/entities/Board.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import InvalidGiveToGetRequirementsException from "../../domain/exceptions/InvalidGiveToGetRequirementsException.js";
import UpdateBoardCommand from "../commands/UpdateBoardCommand.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import BoardResponse, { mapBoardToResponse } from "../responses/BoardResponse.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default class UpdateBoardCommandHandler {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async execute(command: UpdateBoardCommand): Promise<BoardResponse> {
    const boardId = new Uuid(command.boardId);
    const requesterUserId = new Uuid(command.requesterUserId);
    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundException(command.boardId);
    }

    const isOwner = board.ownerId.getValue() === requesterUserId.getValue();

    if (!isOwner) {
      const requesterMembership = await this.boardRepository.findMemberByBoardIdAndUserId(boardId, requesterUserId);

      if (requesterMembership?.role !== "admin") {
        throw new UnauthorizedActionException("Only board owners or admins can update board settings");
      }

      if (
        command.name !== undefined ||
        command.slug !== undefined ||
        command.isPublic !== undefined ||
        command.allowAnonymousVotes !== undefined
      ) {
        throw new UnauthorizedActionException(
          "Only board creators can update board name, slug, public visibility, and anonymous voting"
        );
      }
    }

    const effectiveGiveToGetEnabled =
      command.giveToGetEnabled !== undefined ? command.giveToGetEnabled : board.giveToGetEnabled;
    const effectiveVotesReq =
      command.giveToGetVotesReq !== undefined ? command.giveToGetVotesReq : board.giveToGetVotesReq;
    const effectiveCommentsReq =
      command.giveToGetCommentsReq !== undefined ? command.giveToGetCommentsReq : board.giveToGetCommentsReq;

    if (effectiveGiveToGetEnabled === true && (effectiveVotesReq ?? 0) <= 0 && (effectiveCommentsReq ?? 0) <= 0) {
      throw new InvalidGiveToGetRequirementsException();
    }

    const updatedBoard = new Board(
      board.id.getValue(),
      command.slug ?? board.slug.getValue(),
      command.name ?? board.name,
      command.description !== undefined ? command.description : board.description,
      command.logoUrl !== undefined ? command.logoUrl : board.logoUrl,
      command.primaryColor !== undefined ? command.primaryColor : (board.primaryColor?.getValue() ?? null),
      command.ownerId ?? board.ownerId.getValue(),
      command.isPublic !== undefined ? command.isPublic : board.isPublic,
      command.allowAnonymousVotes !== undefined ? command.allowAnonymousVotes : board.allowAnonymousVotes,
      command.giveToGetEnabled !== undefined ? command.giveToGetEnabled : board.giveToGetEnabled,
      command.giveToGetVotesReq !== undefined ? command.giveToGetVotesReq : board.giveToGetVotesReq,
      command.giveToGetCommentsReq !== undefined ? command.giveToGetCommentsReq : board.giveToGetCommentsReq,
      board.createdAt
    );

    await this.boardRepository.update(updatedBoard);

    const response = mapBoardToResponse(updatedBoard);

    this.realtimePublisher.publish(updatedBoard.id.getValue(), "BoardUpdated", response);

    return response;
  }
}
