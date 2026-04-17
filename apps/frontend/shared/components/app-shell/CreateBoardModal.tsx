"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/localization/i18n/routing";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { CreateBoardForm } from "@/features/boards/components/CreateBoardForm";
import { useAuth } from "@/shared/components/AuthProvider";

type CreateBoardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateBoardModal({ open, onOpenChange }: CreateBoardModalProps) {
  const router = useRouter();
  const tBoards = useTranslations("BoardsEntryGate");
  const { refreshBoards } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{tBoards("dialogTitle")}</DialogTitle>
          <DialogDescription>{tBoards("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <CreateBoardForm
          onSuccess={async (createdBoardSlug) => {
            onOpenChange(false);

            try {
              await refreshBoards();
            } catch {}

            router.push(`/board/${createdBoardSlug}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
