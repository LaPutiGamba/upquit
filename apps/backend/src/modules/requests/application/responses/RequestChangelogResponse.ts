import type { RequestChangelogWithAuthor } from "../../domain/contracts/RequestChangelog.js";

export default interface RequestChangelogResponse {
  id: string;
  requestId: string;
  userId: string;
  userDisplayName: string | null;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date | null;
}

export function mapRequestChangelogToResponse(changelog: RequestChangelogWithAuthor): RequestChangelogResponse {
  return {
    id: changelog.id,
    requestId: changelog.requestId,
    userId: changelog.userId,
    userDisplayName: changelog.userDisplayName,
    field: changelog.field,
    oldValue: changelog.oldValue,
    newValue: changelog.newValue,
    createdAt: changelog.createdAt
  };
}
