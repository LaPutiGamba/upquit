"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useRequestDetailPage } from "@/features/requests/hooks/useRequestDetailPage";

import { CategorySelectorMultiple } from "@/features/requests/components/CategorySelectorMultiple";
import { RequestDescription, RequestHeader, RequestTitle } from "@/features/requests/components/RequestHeader";
import { RequestMetadataRow } from "@/features/requests/components/RequestMetadataRow";
import {
  requestService,
  getRequestCategoryIds,
  type RequestResponse,
  type UpdateRequestPayload
} from "@/features/requests/services/requestService";
import { useAuth } from "@/shared/components/AuthProvider";
import { Spinner } from "@/shared/components/ui/spinner";
import { RequestActivityTabs } from "@/features/requests/components/RequestActivityTabs";

const sectionLabelClassName = "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";

interface RequestDetailPageContentProps {
  slug: string;
  id: string;
}

export function RequestDetailPageContent({ slug, id }: RequestDetailPageContentProps) {
  const { user } = useAuth();
  const { board, request, loading, notFound } = useRequestDetailPage(slug, id);
  const [editableRequest, setEditableRequest] = useState<RequestResponse | null>(null);
  const [changelogRefreshKey, setChangelogRefreshKey] = useState(0);

  useEffect(() => {
    setEditableRequest(request);
  }, [request]);

  const canEdit = useMemo(() => {
    if (!user || !board || !editableRequest) {
      return false;
    }

    return editableRequest.authorId === user.id || board.ownerId === user.id;
  }, [board, editableRequest, user]);

  const categoryIds = useMemo(
    () => getRequestCategoryIds(editableRequest ?? { categoryIds: [], categories: [] }),
    [editableRequest]
  );

  const handleUpdateRequest = async (payload: UpdateRequestPayload) => {
    if (!board || !editableRequest) {
      return;
    }

    const previousRequest = editableRequest;
    const nextRequest = { ...editableRequest, ...payload };

    setEditableRequest(nextRequest);

    try {
      const updatedRequest = await requestService.updateRequest(editableRequest.id, board.id, payload);

      const updatedCategoryIds = getRequestCategoryIds(updatedRequest);
      const nextCategoryIds = getRequestCategoryIds(nextRequest);
      const shouldKeepOptimisticCategoryIds =
        payload.categoryIds !== undefined &&
        updatedRequest.categoryIds === undefined &&
        (!updatedRequest.categories || updatedRequest.categories.length === 0);

      setEditableRequest({
        ...updatedRequest,
        categoryIds: shouldKeepOptimisticCategoryIds ? nextCategoryIds : updatedCategoryIds
      });
      setChangelogRefreshKey((currentValue) => currentValue + 1);
    } catch {
      setEditableRequest(previousRequest);
      toast.error("Could not save request changes");
      throw new Error("Could not save request changes");
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <Spinner className="size-12" />
      </main>
    );
  }

  if (notFound || !board || !editableRequest) {
    return (
      <main className="container mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Request not found.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto flex max-w-6xl flex-1 flex-col px-4 py-8 md:py-10">
        <section className="pb-8">
          <RequestHeader variant="page" canEdit={canEdit}>
            <RequestTitle
              variant="page"
              as="h1"
              canEdit={canEdit}
              onSave={(nextTitle) => handleUpdateRequest({ title: nextTitle })}
            >
              {editableRequest.title}
            </RequestTitle>
            <RequestDescription
              canEdit={canEdit}
              onSave={(nextDescription) => handleUpdateRequest({ description: nextDescription })}
            >
              {editableRequest.description ?? ""}
            </RequestDescription>
            <div className="mt-5 space-y-3">
              <p className={sectionLabelClassName}>Categories</p>
              <CategorySelectorMultiple
                boardId={board.id}
                value={categoryIds}
                onChange={(nextValues) => handleUpdateRequest({ categoryIds: nextValues })}
                disabled={!canEdit}
              />
            </div>
            <RequestMetadataRow
              request={editableRequest}
              boardId={board.id}
              canEdit={canEdit}
              onStatusSave={(nextStatus) => handleUpdateRequest({ status: nextStatus })}
              size="md"
              className="mt-5"
            />
          </RequestHeader>
        </section>

        <section>
          <RequestActivityTabs
            requestId={editableRequest.id}
            boardId={board.id}
            refreshToken={changelogRefreshKey}
            className="mt-4 flex h-[66vh] min-h-90 flex-col min-w-0 overflow-hidden"
          />
        </section>
      </main>
    </div>
  );
}
