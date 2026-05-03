import CommentCreatedEvent from "../../../comments/domain/events/CommentCreatedEvent.js";
import type INotificationRepository from "../../domain/contracts/INotificationRepository.js";
import Notification from "../../domain/entities/Notification.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import RequestRepository from "../../../requests/domain/contracts/RequestRepository.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";

export default class CreateNotificationsOnCommentCreated {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly boardRepository: BoardRepository,
    private readonly requestRepository: RequestRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async handle(event: CommentCreatedEvent): Promise<void> {
    const request = await this.requestRepository.findById(new Uuid(event.requestId));
    if (!request) return;

    const boardId = request.boardId.getValue();
    const board = await this.boardRepository.findById(new Uuid(boardId));
    if (!board) return;

    const members = await this.boardRepository.findMembersByBoardId(new Uuid(boardId));
    const recipients = new Set<string>([board.ownerId.getValue(), request.authorId.getValue()]);

    for (const member of members) {
      if (member.role === "admin") {
        recipients.add(member.userId);
      }
    }

    recipients.delete(event.userId);

    for (const recipientId of recipients) {
      const notification = new Notification({
        id: crypto.randomUUID(),
        userId: recipientId,
        boardId,
        type: "comment.created",
        payload: {
          title: "New comment",
          body: "A new comment was posted on a request.",
          requestId: event.requestId,
          commentId: event.commentId,
          isAdminReply: event.isAdminReply
        },
        read: false,
        createdAt: new Date().toISOString()
      });

      await this.notificationRepository.create(notification);
      this.realtimePublisher.publish(`notification.${recipientId}`, "NotificationCreated", notification);
    }
  }
}
