export default class AddBoardCategoryCommand {
  constructor(
    readonly boardId: string,
    readonly name: string
  ) {}
}
