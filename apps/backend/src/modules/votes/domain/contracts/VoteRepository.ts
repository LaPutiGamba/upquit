import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Vote from "../entities/Vote.js";

export default interface VoteRepository {
  findById(id: Uuid): Promise<Vote | null>;
  findByRequestAndUser(requestId: Uuid, userId: Uuid): Promise<Vote | null>;
  countByRequestId(requestId: Uuid): Promise<number>;
  save(vote: Vote): Promise<void>;
  delete(id: Uuid): Promise<void>;
}
