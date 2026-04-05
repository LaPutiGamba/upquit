import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import GiveToGetProgress from "../entities/GiveToGetProgress.js";

export default interface GiveToGetProgressRepository {
  findById(id: Uuid): Promise<GiveToGetProgress | null>;
  findByUserAndBoard(userId: Uuid, boardId: Uuid): Promise<GiveToGetProgress | null>;
  save(progress: GiveToGetProgress): Promise<void>;
  update(progress: GiveToGetProgress): Promise<void>;

  incrementVotesGiven(userId: Uuid, boardId: Uuid): Promise<void>;
  decrementVotesGiven(userId: Uuid, boardId: Uuid): Promise<void>;
}
