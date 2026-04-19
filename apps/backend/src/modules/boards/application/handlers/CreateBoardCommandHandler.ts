import Board from "../../domain/entities/Board.js";
import Slug from "../../domain/value-objects/Slug.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import InvalidGiveToGetRequirementsException from "../../domain/exceptions/InvalidGiveToGetRequirementsException.js";
import CreateBoardCommand from "../commands/CreateBoardCommand.js";
import BoardAlreadyExistsException from "../exceptions/BoardAlreadyExistsException.js";
import BoardResponse, { mapBoardToResponse } from "../responses/BoardResponse.js";

export default class CreateBoardCommandHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: CreateBoardCommand): Promise<BoardResponse> {
    const slug = new Slug(command.slug);
    const existingBoard = await this.boardRepository.findBySlug(slug);

    if (existingBoard) {
      throw new BoardAlreadyExistsException(command.slug);
    }

    const isGiveToGetEnabled = command.giveToGetEnabled === true;
    const votesRequired = command.giveToGetVotesReq ?? 0;
    const commentsRequired = command.giveToGetCommentsReq ?? 0;

    if (isGiveToGetEnabled && votesRequired <= 0 && commentsRequired <= 0) {
      throw new InvalidGiveToGetRequirementsException();
    }

    const board = new Board(
      crypto.randomUUID(),
      command.slug,
      command.name,
      command.description,
      command.logoUrl,
      command.primaryColor,
      command.ownerId,
      command.isPublic,
      command.allowAnonymousVotes,
      command.giveToGetEnabled,
      command.giveToGetVotesReq,
      command.giveToGetCommentsReq,
      new Date()
    );

    await this.boardRepository.save(board);

    return mapBoardToResponse(board);
  }
}
