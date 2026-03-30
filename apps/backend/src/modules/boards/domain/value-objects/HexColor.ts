export default class HexColor {
  private readonly value: string;

  constructor(value: string) {
    this.ensureIsValidHex(value);
    this.value = value;
  }

  private ensureIsValidHex(value: string): void {
    if (value.length > 7) {
      throw new Error("Hex color exceeds maximum length of 7 characters");
    }

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(value)) {
      throw new Error(`Invalid hex color format: ${value}`);
    }
  }

  public getValue(): string {
    return this.value;
  }
}
