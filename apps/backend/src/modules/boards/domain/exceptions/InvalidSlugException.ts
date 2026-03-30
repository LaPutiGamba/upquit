import DomainException from "../../../../shared/domain/exceptions/DomainException.js";

export default class InvalidSlugException extends DomainException {
  constructor(slug: string) {
    super(`The slug provided is invalid or exceeds the maximum length: ${slug}`);
  }
}
