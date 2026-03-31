import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import User from "../entities/User.js";
import Email from "../value-objects/Email.js";

export default interface UserRepository {
  findById(id: Uuid): Promise<User | null>;
  findByIdIncludingInactive(id: Uuid): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByEmailIncludingInactive(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
}
