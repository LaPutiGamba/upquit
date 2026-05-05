import InvalidUsernameException from "../exceptions/InvalidUsernameException.js";

export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/;

export default class Username {
  private readonly value: string;

  constructor(value: string) {
    this.ensureIsValidUsername(value);
    this.value = value.trim().toLowerCase();
  }

  private ensureIsValidUsername(value: string): void {
    const normalizedValue = value.trim().toLowerCase();

    if (!USERNAME_PATTERN.test(normalizedValue)) {
      throw new InvalidUsernameException(value);
    }
  }

  public getValue(): string {
    return this.value;
  }
}
