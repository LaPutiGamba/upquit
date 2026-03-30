export default class Slug {
  private readonly value: string;

  constructor(value: string) {
    this.ensureIsValidSlug(value);
    this.value = value;
  }

  private ensureIsValidSlug(value: string): void {
    if (value.length > 63) {
      throw new Error("Slug exceeds maximum length of 63 characters");
    }
    
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(value)) {
      throw new Error(`Invalid slug format: ${value}. Must contain only lowercase letters, numbers, and hyphens.`);
    }
  }

  public getValue(): string {
    return this.value;
  }
}
