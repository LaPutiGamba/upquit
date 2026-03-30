export default class Email {
  private readonly value: string;

  constructor(value: string) {
    this.ensureIsValidEmail(value);
    this.value = value;
  }

  private ensureIsValidEmail(value: string): void {
    if (value.length > 255) {
      throw new Error("Email exceeds maximum length of 255 characters");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error(`Invalid email format: ${value}`);
    }
  }

  public getValue(): string {
    return this.value;
  }
}
