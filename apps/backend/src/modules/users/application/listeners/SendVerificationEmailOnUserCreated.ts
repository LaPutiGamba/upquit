import UserCreatedEvent from "../../domain/events/UserCreatedEvent.js";
import EmailSender from "../../domain/contracts/EmailSender.js";

export default class SendVerificationEmailOnUserCreated {
  constructor(private readonly emailSender: EmailSender) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailSender.sendVerificationEmail(event.email, event.userId, event.displayName);
  }
}
