import bcrypt from "bcrypt";

import PasswordHasher from "../../domain/contracts/PasswordHasher.js";

export default class BcryptPasswordHasher implements PasswordHasher {
  hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, 12);
  }

  compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
