import Uuid from "../../../../shared/domain/value-objects/Uuid.js";
import Request from "../entities/Request.js";
import Subscription from "../entities/Subscription.js";
import type { RequestChangelogCreateInput, RequestChangelogWithAuthor } from "./RequestChangelog.js";

export default interface RequestRepository {
  // Request Operations
  findById(id: Uuid): Promise<Request | null>;
  findByBoardId(boardId: Uuid): Promise<Request[]>;
  isBoardOwnerOrAdmin(boardId: Uuid, userId: Uuid): Promise<boolean>;
  save(request: Request): Promise<void>;
  update(request: Request): Promise<void>;
  delete(id: string): Promise<void>;
  addChangelogEntries(entries: RequestChangelogCreateInput[]): Promise<void>;
  findChangelogByRequestId(id: Uuid): Promise<RequestChangelogWithAuthor[]>;
  getCategoryNamesByIds(categoryIds: string[]): Promise<{ id: string; name: string }[]>;
  addDeletedCategoriesForChangelog(
    records: { requestChangelogId: string; categoryId: string; categoryName: string }[]
  ): Promise<void>;

  incrementVoteCount(id: Uuid): Promise<void>;
  decrementVoteCount(id: Uuid): Promise<void>;

  // Request Categories Operations
  setRequestCategories(requestId: Uuid, categoryIds: string[]): Promise<void>;
  getRequestCategoryIds(requestId: Uuid): Promise<string[]>;
  removeUnusedCategories(categoryIds: string[]): Promise<string[]>;

  // Subscription Operations
  addSubscription(subscription: Subscription): Promise<void>;
  removeSubscription(userId: Uuid, requestId: Uuid): Promise<void>;
  isSubscribed(userId: Uuid, requestId: Uuid): Promise<boolean>;
  findSubscribersByRequestId(requestId: Uuid): Promise<string[]>;
}
