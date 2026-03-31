import bcrypt from "bcrypt";

import PasswordHasher from "../../domain/contracts/PasswordHasher.js";

export default class BcryptPasswordHasher implements PasswordHasher {
  compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
