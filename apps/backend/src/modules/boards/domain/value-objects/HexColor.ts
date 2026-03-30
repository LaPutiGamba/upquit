import InvalidHexColorException from "../exceptions/InvalidHexColorException.js";

export default class HexColor {
  private readonly value: string;

  constructor(value: string) {
    this.ensureIsValidHex(value);
    this.value = value;
  }

  private ensureIsValidHex(value: string): void {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (value.length > 7 || !hexRegex.test(value)) {
      throw new InvalidHexColorException(value);
    }
  }

  public getValue(): string {
    return this.value;
  }
}
