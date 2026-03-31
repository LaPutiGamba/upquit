import Board from "../../domain/entities/Board.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import UpdateBoardCommand from "../commands/UpdateBoardCommand.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import BoardResponse, { mapBoardToResponse } from "../responses/BoardResponse.js";

export default class UpdateBoardCommandHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: UpdateBoardCommand): Promise<BoardResponse> {
    const boardId = new Uuid(command.boardId);
    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundException(command.boardId);
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

    return mapBoardToResponse(updatedBoard);
  }
}
