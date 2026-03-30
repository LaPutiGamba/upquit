import InvalidEmailException from "../exceptions/InvalidEmailException.js";

export default class Email {
  private readonly value: string;

  constructor(value: string) {
    this.ensureIsValidEmail(value);
    this.value = value;
  }

  private ensureIsValidEmail(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value.length > 255 || !emailRegex.test(value)) {
      throw new InvalidEmailException(value);
    }
  }

  public getValue(): string {
    return this.value;
  }
}
