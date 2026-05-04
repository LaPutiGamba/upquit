import VoteCreatedEvent from "../../../votes/domain/events/VoteCreatedEvent.js";
import type INotificationRepository from "../../domain/contracts/INotificationRepository.js";
import Notification from "../../domain/entities/Notification.js";
import BoardRepository from "../../../boards/domain/contracts/BoardRepository.js";
import RequestRepository from "../../../requests/domain/contracts/RequestRepository.js";
import UserRepository from "../../../users/domain/contracts/UserRepository.js";
import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import RealtimePublisher from "../../../../shared/domain/contracts/RealtimePublisher.js";

export default class CreateNotificationsOnVoteCreated {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly boardRepository: BoardRepository,
    private readonly requestRepository: RequestRepository,
    private readonly userRepository: UserRepository,
    private readonly realtimePublisher: RealtimePublisher
  ) {}

  async handle(event: VoteCreatedEvent): Promise<void> {
    const board = await this.boardRepository.findById(new Uuid(event.boardId));
    if (!board) return;
    const request = await this.requestRepository.findById(new Uuid(event.requestId));
    const actor = await this.userRepository.findById(new Uuid(event.userId));

    const requestTitle = request ? request.title : undefined;
    const boardSlug = board.slug.getValue();

    const members = await this.boardRepository.findMembersByBoardId(new Uuid(event.boardId));
    const recipients = new Set<string>([board.ownerId.getValue()]);

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
        boardId: event.boardId,
        type: "vote.created",
        payload: {
          title: "New vote",
          body: `@${actor?.displayName ?? "Someone"} has upvoted your request \"${requestTitle ?? "request"}\"!`,
          actor: {
            id: event.userId,
            displayName: actor?.displayName ?? null,
            avatarUrl: actor?.avatarUrl ?? null,
            profileUrl: `/users/${event.userId}`
          },
          requestId: event.requestId,
          requestTitle,
          voteId: event.voteId,
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
