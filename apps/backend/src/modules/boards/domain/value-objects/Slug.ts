import InvalidSlugException from "../exceptions/InvalidSlugException.js";

export default class Slug {
  private readonly value: string;

  constructor(value: string) {
    this.ensureIsValidSlug(value);
    this.value = value;
  }

  private ensureIsValidSlug(value: string): void {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (value.length > 63 || !slugRegex.test(value)) {
      throw new InvalidSlugException(value);
    }
  }

  public getValue(): string {
    return this.value;
  }
}
