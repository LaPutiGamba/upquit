import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Request from "../entities/Request.js";
import Subscription from "../entities/Subscription.js";
import type { RequestChangelogCreateInput, RequestChangelogWithAuthor } from "./RequestChangelog.js";

export default interface RequestRepository {
  // Request Operations
  findById(id: Uuid): Promise<Request | null>;
  findByBoardId(boardId: Uuid): Promise<Request[]>;
  save(request: Request): Promise<void>;
  update(request: Request): Promise<void>;
  addChangelogEntries(entries: RequestChangelogCreateInput[]): Promise<void>;
  findChangelogByRequestId(id: Uuid): Promise<RequestChangelogWithAuthor[]>;

  incrementVoteCount(id: Uuid): Promise<void>;
  decrementVoteCount(id: Uuid): Promise<void>;

  // Subscription Operations
  addSubscription(subscription: Subscription): Promise<void>;
  removeSubscription(userId: Uuid, requestId: Uuid): Promise<void>;
  isSubscribed(userId: Uuid, requestId: Uuid): Promise<boolean>;
}
