import RequestUpdatedEvent from "../../../requests/domain/events/RequestUpdatedEvent.js";
import type INotificationRepository from "../../domain/contracts/INotificationRepository.js";
import Notification from "../../domain/entities/Notification.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import RequestRepository from "../../../requests/domain/contracts/RequestRepository.js";
import UserRepository from "../../../users/domain/contracts/UserRepository.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";

const FIELD_LABELS: Record<string, string> = {
  title: "title",
  description: "description",
  status: "status",
  categoryIds: "categories",
  voteCount: "vote count",
  isPinned: "pin state",
  isHidden: "visibility",
  adminNote: "admin note"
};

export default class CreateNotificationsOnRequestUpdated {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly boardRepository: BoardRepository,
    private readonly requestRepository: RequestRepository,
    private readonly userRepository: UserRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async handle(event: RequestUpdatedEvent): Promise<void> {
    if (event.actorId === event.authorId || event.changedFields.length === 0) {
      return;
    }

    const request = await this.requestRepository.findById(new Uuid(event.requestId));
    if (!request) return;

    const board = await this.boardRepository.findById(new Uuid(event.boardId));
    if (!board) return;

    const actor = await this.userRepository.findById(new Uuid(event.actorId));
    const boardSlug = board.slug.getValue();
    const changedFields = event.changedFields.map((field) => FIELD_LABELS[field] ?? field);

    const notification = new Notification({
      id: crypto.randomUUID(),
      userId: event.authorId,
      boardId: event.boardId,
      type: "request.updated",
      payload: {
        title: "Request updated",
        body:
          changedFields.length === 1
            ? `@${actor?.displayName ?? "Someone"} updated the ${changedFields[0]} of your request \"${request.title}\".`
            : `@${actor?.displayName ?? "Someone"} updated ${changedFields.join(", ")} on your request \"${request.title}\".`,
        actor: {
          id: event.actorId,
          username: actor?.username ?? null,
          displayName: actor?.displayName ?? null,
          avatarUrl: actor?.avatarUrl ?? null,
          profileUrl: actor?.username ? `/users/${actor.username}` : null
        },
        requestId: event.requestId,
        requestTitle: request.title,
        changedFields,
        boardSlug,
        url: `/board/${boardSlug}/request/${event.requestId}`
      },
      read: false,
      createdAt: new Date().toISOString()
    });

    await this.notificationRepository.create(notification);
    this.realtimePublisher.publish(`notification.${event.authorId}`, "NotificationCreated", {
      data: notification,
      timestamp: notification.createdAt
    });
  }
}
