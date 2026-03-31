import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Category from "../../domain/entities/Category.js";
import BoardRepository from "../../domain/contracts/BoardRepository.js";
import AddBoardCategoryCommand from "../commands/AddBoardCategoryCommand.js";
import BoardNotFoundException from "../exceptions/BoardNotFoundException.js";
import CategoryResponse, { mapCategoryToResponse } from "../responses/CategoryResponse.js";

export default class AddBoardCategoryCommandHandler {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: AddBoardCategoryCommand): Promise<CategoryResponse> {
    const boardId = new Uuid(command.boardId);
    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundException(command.boardId);
    }

    const category = new Category(crypto.randomUUID(), command.boardId, command.name, new Date());
    await this.boardRepository.addCategory(category);

    return mapCategoryToResponse(category);
  }
}
