import InvalidUsernameException from "../exceptions/InvalidUsernameException.js";

export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/;

export default class Username {
  private readonly value: string;

  constructor(value: string) {
    const normalized = Username.normalize(value);
    this.ensureIsValidUsername(normalized);
    this.value = normalized;
  }

  private static normalize(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .normalize("NFC");
  }

  private ensureIsValidUsername(normalizedValue: string): void {
    if (!USERNAME_PATTERN.test(normalizedValue)) {
      throw new InvalidUsernameException(normalizedValue);
    }
  }

  public getValue(): string {
    return this.value;
  }
}
