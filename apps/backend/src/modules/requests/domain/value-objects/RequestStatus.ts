import InvalidRequestStatusException from "../exceptions/InvalidRequestStatusException.js";

export type StatusValue = "open" | "planned" | "in_progress" | "completed" | "rejected";

export default class RequestStatus {
  private readonly value: StatusValue;
  private static readonly VALID_STATUSES: StatusValue[] = ["open", "planned", "in_progress", "completed", "rejected"];

  constructor(value: StatusValue = "open") {
    this.validate(value);
    this.value = value;
  }

  private validate(value: StatusValue): void {
    if (!RequestStatus.VALID_STATUSES.includes(value)) {
      throw new InvalidRequestStatusException(`Invalid request status: ${value}`);
    }
  }

  public getValue(): StatusValue {
    return this.value;
  }
}
