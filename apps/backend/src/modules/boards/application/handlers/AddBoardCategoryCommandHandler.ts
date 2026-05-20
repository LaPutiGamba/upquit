import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Category from "../../domain/entities/Category.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import AddBoardCategoryCommand from "../commands/AddBoardCategoryCommand.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import CategoryResponse, { mapCategoryToResponse } from "../responses/CategoryResponse.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default class AddBoardCategoryCommandHandler {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async execute(command: AddBoardCategoryCommand): Promise<CategoryResponse> {
    const boardId = new Uuid(command.boardId);
    const board = await this.boardRepository.findById(boardId);
    const requesterUserId = new Uuid(command.requesterUserId);

    if (!board) {
      throw new BoardNotFoundException(command.boardId);
    }

    const requesterIsBoardOwner = board.owner.id.getValue() === requesterUserId.getValue();

    if (!requesterIsBoardOwner) {
      const requesterMembership = await this.boardRepository.findMemberByBoardIdAndUserId(boardId, requesterUserId);

      if (requesterMembership?.role !== "admin") {
        throw new UnauthorizedActionException("Only board owners or admins can manage categories");
      }
    }

    const category = new Category(crypto.randomUUID(), command.boardId, command.name, new Date());
    await this.boardRepository.addCategory(category);

    const response = mapCategoryToResponse(category);

    this.realtimePublisher.publish(command.boardId, "CategoryAdded", {
      data: {
        boardId: command.boardId,
        category: response
      },
      timestamp: new Date().toISOString()
    });

    return response;
  }
}
