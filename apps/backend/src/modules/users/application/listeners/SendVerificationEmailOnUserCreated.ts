import UserCreatedEvent from "../../domain/events/UserCreatedEvent.js";
import ResendEmailSender from "../../../../shared/infrastructure/services/ResendEmailSender.js";

export default class SendVerificationEmailOnUserCreated {
  constructor(private readonly emailSender: ResendEmailSender) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailSender.sendVerificationEmail(event.email, event.userId, event.displayName);
  }
}
