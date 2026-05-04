import RequestCreatedEvent from "../../../requests/domain/events/RequestCreatedEvent.js";
import type INotificationRepository from "../../domain/contracts/INotificationRepository.js";
import Notification from "../../domain/entities/Notification.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";
import UserRepository from "../../../users/domain/contracts/UserRepository.js";

export default class CreateNotificationsOnRequestCreated {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly boardRepository: BoardRepository,
    private readonly userRepository: UserRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async handle(event: RequestCreatedEvent): Promise<void> {
    const board = await this.boardRepository.findById(new Uuid(event.boardId));
    if (!board) return;

    const members = await this.boardRepository.findMembersByBoardId(new Uuid(event.boardId));
    const recipients = new Set<string>([board.ownerId.getValue()]);

    for (const member of members) {
      if (member.role === "admin") {
        recipients.add(member.userId);
      }
    }

    recipients.delete(event.authorId);

    const actor = await this.userRepository.findById(new Uuid(event.authorId));
    const boardSlug = board.slug.getValue();

    for (const recipientId of recipients) {
      const notification = new Notification({
        id: crypto.randomUUID(),
        userId: recipientId,
        boardId: event.boardId,
        type: "request.created",
        payload: {
          title: "New request",
          body: `@${actor?.displayName ?? "Someone"} created the request \"${event.title}\"!`,
          actor: {
            id: event.authorId,
            displayName: actor?.displayName ?? null,
            avatarUrl: actor?.avatarUrl ?? null,
            profileUrl: `/users/${event.authorId}`
          },
          requestId: event.requestId,
          requestTitle: event.title,
          boardSlug,
          url: `/board/${boardSlug}/request/${event.requestId}`
        },
        read: false,
        createdAt: new Date().toISOString()
      });

      await this.notificationRepository.create(notification);
      this.realtimePublisher.publish(`notification.${recipientId}`, "NotificationCreated", notification);
    }
  }
}
