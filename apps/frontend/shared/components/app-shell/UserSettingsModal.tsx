"use client";

import { useEffect, useReducer } from "react";
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

type UserSettingsState = {
  username: string;
  displayName: string;
  avatarUrl: string;
  isSaving: boolean;
};

type UserSettingsAction =
  | { type: "SET_USERNAME"; payload: string }
  | { type: "SET_DISPLAY_NAME"; payload: string }
  | { type: "SET_AVATAR_URL"; payload: string }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "RESET"; payload: { username: string; displayName: string; avatarUrl: string } };

function userSettingsReducer(state: UserSettingsState, action: UserSettingsAction): UserSettingsState {
  switch (action.type) {
    case "SET_USERNAME":
      return { ...state, username: action.payload };
    case "SET_DISPLAY_NAME":
      return { ...state, displayName: action.payload };
    case "SET_AVATAR_URL":
      return { ...state, avatarUrl: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "RESET":
      return { ...state, username: action.payload.username, displayName: action.payload.displayName, avatarUrl: action.payload.avatarUrl, isSaving: false };
    default:
      return state;
  }
}

export function UserSettingsModal({ open, onOpenChange }: UserSettingsModalProps) {
  const t = useTranslations("AppShell");
  const { user, setUser } = useAuth();
  const [state, dispatch] = useReducer(userSettingsReducer, { username: "", displayName: "", avatarUrl: "", isSaving: false });

  useEffect(() => {
    if (!open) {
      return;
    }

    dispatch({ type: "RESET", payload: { username: user?.username ?? "", displayName: user?.displayName ?? "", avatarUrl: user?.avatarUrl ?? "" } });
  }, [open, user]);

  const handleSave = async () => {
    if (!user) {
      return;
    }

    const nextDisplayName = state.displayName.trim();
    if (nextDisplayName.length < 2) {
      toast.error(t("settings.validation.displayName"));
      return;
    }

    const nextUsername = state.username.trim().toLowerCase();
    if (nextUsername.length < 3) {
      toast.error(t("settings.validation.username"));
      return;
    }

    dispatch({ type: "SET_SAVING", payload: true });

    try {
      const updatedUser = await authService.updateUser(user.id, {
        username: nextUsername,
        displayName: nextDisplayName,
        avatarUrl: state.avatarUrl.trim() || null
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
      dispatch({ type: "SET_SAVING", payload: false });
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
            <FieldLabel>{t("settings.fields.username")}</FieldLabel>
            <Input
              value={state.username}
              onChange={(event) => dispatch({ type: "SET_USERNAME", payload: event.target.value.toLowerCase() })}
              placeholder={t("settings.fields.usernamePlaceholder")}
              autoComplete="username"
            />
          </Field>
          <Field>
            <FieldLabel>{t("settings.fields.displayName")}</FieldLabel>
            <Input value={state.displayName} onChange={(event) => dispatch({ type: "SET_DISPLAY_NAME", payload: event.target.value })} />
          </Field>
          <Field>
            <FieldLabel>{t("settings.fields.avatarUrl")}</FieldLabel>
            <Input value={state.avatarUrl} onChange={(event) => dispatch({ type: "SET_AVATAR_URL", payload: event.target.value })} placeholder="https://" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={state.isSaving}>
              {t("settings.actions.cancel")}
            </Button>
            <Button onClick={() => void handleSave()} disabled={state.isSaving}>
              {state.isSaving ? t("settings.actions.saving") : t("settings.actions.save")}
            </Button>
          </div>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
}
