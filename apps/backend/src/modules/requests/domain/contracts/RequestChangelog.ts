export interface RequestChangelogCreateInput {
  requestId: string;
  userId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface RequestChangelogWithAuthor {
  id: string;
  requestId: string;
  userId: string;
  userDisplayName: string | null;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date | null;
}
