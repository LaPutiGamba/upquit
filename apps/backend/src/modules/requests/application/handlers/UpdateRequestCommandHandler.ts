import Request from "../../domain/entities/Request.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import RequestRepository from "../../domain/contracts/RequestRepository.js";
import type { RequestChangelogCreateInput } from "../../domain/contracts/RequestChangelog.js";
import UpdateRequestCommand from "../commands/UpdateRequestCommand.js";
import RequestNotFoundException from "../exceptions/RequestNotFoundException.js";
import RequestResponse, { mapRequestToResponse } from "../responses/RequestResponse.js";
import UnauthorizedActionException from "../../../../shared/application/exceptions/UnauthorizedActionException.js";

export default class UpdateRequestCommandHandler {
  constructor(
    private readonly requestRepository: RequestRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async execute(command: UpdateRequestCommand): Promise<RequestResponse> {
    const requestId = new Uuid(command.requestId);
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new RequestNotFoundException(command.requestId);
    }

    const isAuthor = request.authorId.getValue() === command.userId;

    if (!isAuthor) {
      const canManageBoardRequests = await this.requestRepository.isBoardOwnerOrAdmin(
        request.boardId,
        new Uuid(command.userId)
      );

      if (!canManageBoardRequests) {
        throw new UnauthorizedActionException(
          "Only request authors, board owners, or board admins can update requests"
        );
      }
    }

    const categoryIds = command.categoryIds !== undefined ? command.categoryIds : request.categoryIds;

    const updatedRequest = new Request(
      request.id.getValue(),
      request.boardId.getValue(),
      request.authorId.getValue(),
      categoryIds,
      command.title ?? request.title,
      command.description !== undefined ? command.description : request.description,
      command.status ?? request.status.getValue(),
      command.voteCount !== undefined ? command.voteCount : request.voteCount,
      command.isPinned !== undefined ? command.isPinned : request.isPinned,
      command.isHidden !== undefined ? command.isHidden : request.isHidden,
      command.adminNote !== undefined ? command.adminNote : request.adminNote,
      request.createdAt
    );

    await this.requestRepository.update(updatedRequest);

    if (command.categoryIds !== undefined) {
      const oldCategoryIds = request.categoryIds;
      const newCategoryIds = command.categoryIds;
      const removedCategoryIds = oldCategoryIds.filter((id) => !newCategoryIds.includes(id));

      await this.requestRepository.setRequestCategories(requestId, newCategoryIds);

      if (removedCategoryIds.length > 0) {
        await this.requestRepository.removeUnusedCategories(removedCategoryIds);
      }
    }

    const changelogEntries = this.buildChangelogEntries(request, command);
    if (changelogEntries.length > 0) {
      await this.requestRepository.addChangelogEntries(changelogEntries);
    }

    const response = mapRequestToResponse(updatedRequest);
    const hasTitleChanged = request.title !== updatedRequest.title;
    const hasStatusChanged = request.status.getValue() !== updatedRequest.status.getValue();

    if (hasTitleChanged || hasStatusChanged) {
      this.realtimePublisher.publish(updatedRequest.boardId.getValue(), "RequestUpdated", {
        boardId: updatedRequest.boardId.getValue(),
        request: response
      });
    }

    return response;
  }

  private buildChangelogEntries(request: Request, command: UpdateRequestCommand): RequestChangelogCreateInput[] {
    const entries: RequestChangelogCreateInput[] = [];

    const currentValues = {
      title: request.title,
      description: request.description,
      status: request.status.getValue(),
      categoryIds: request.categoryIds.join(","),
      voteCount: request.voteCount,
      isPinned: request.isPinned,
      isHidden: request.isHidden,
      adminNote: request.adminNote
    } as const;

    const nextValues = {
      title: command.title,
      description: command.description,
      status: command.status,
      categoryIds: command.categoryIds?.join(","),
      voteCount: command.voteCount,
      isPinned: command.isPinned,
      isHidden: command.isHidden,
      adminNote: command.adminNote
    } as const;

    for (const field of Object.keys(nextValues) as Array<keyof typeof nextValues>) {
      const nextValue = nextValues[field];

      if (nextValue === undefined) {
        continue;
      }

      const currentValue = currentValues[field];
      if (currentValue === nextValue) {
        continue;
      }

      entries.push({
        requestId: request.id.getValue(),
        userId: command.userId,
        field,
        oldValue: this.normalizeValue(currentValue),
        newValue: this.normalizeValue(nextValue)
      });
    }

    return entries;
  }

  private normalizeValue(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    return String(value);
  }
}
