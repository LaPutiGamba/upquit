"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { toast } from "@/shared/components/ui/sonner";
import { authService } from "@/features/authentication/services/authService";
import { useAuth } from "@/shared/components/AuthProvider";

type UserSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserSettingsModal({ open, onOpenChange }: UserSettingsModalProps) {
  const t = useTranslations("AppShell");
  const { user, setUser } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDisplayName(user?.displayName ?? "");
    setAvatarUrl(user?.avatarUrl ?? "");
  }, [open, user]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    const nextDisplayName = displayName.trim();
    if (nextDisplayName.length < 2) {
      toast.error(t("settings.validation.displayName"));
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await authService.updateUser(user.id, {
        displayName: nextDisplayName,
        avatarUrl: avatarUrl.trim() || null
      });

      setUser(updatedUser);
      onOpenChange(false);
      toast.success(t("settings.saved"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("settings.failed"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
          <DialogDescription>{t("settings.description")}</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>{t("settings.fields.displayName")}</FieldLabel>
            <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </Field>
          <Field>
            <FieldLabel>{t("settings.fields.avatarUrl")}</FieldLabel>
            <Input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              {t("settings.actions.cancel")}
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving ? t("settings.actions.saving") : t("settings.actions.save")}
            </Button>
          </div>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
