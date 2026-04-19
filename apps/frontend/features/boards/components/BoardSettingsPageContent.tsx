"use client";

import { useEffect, useMemo, useState } from "react";
import { type Resolver, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { Link, useRouter } from "@/localization/i18n/routing";
import { boardService } from "@/features/boards/services/boardService";
import { useAuth } from "@/shared/components/AuthProvider";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ColorPicker } from "@/shared/components/ui/color-picker";
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "@/shared/components/ui/sonner";
import { UnauthorizedError } from "@/shared/lib/apiClient";
import { slugify } from "@/shared/lib/utils";

interface BoardSettingsPageContentProps {
  slug: string;
}

function createBoardSettingsSchema(t: (key: string) => string) {
  return z
    .object({
      name: z.string().min(3, t("validation.nameMin")),
      slug: z
        .string()
        .min(3, t("validation.slugMin"))
        .max(63, t("validation.slugMax"))
        .regex(/^[a-z0-9-]+$/, t("validation.slugPattern")),
      description: z.string().max(300, t("validation.descriptionMax")).optional(),
      logoUrl: z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || z.string().url().safeParse(value).success, t("validation.logoUrl")),
      primaryColor: z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value), t("validation.primaryColor")),
      isPublic: z.boolean(),
      allowAnonymousVotes: z.boolean(),
      giveToGetEnabled: z.boolean(),
      giveToGetVotesReq: z.coerce.number().min(0, t("validation.giveToGetVotesReq")),
      giveToGetCommentsReq: z.coerce.number().min(0, t("validation.giveToGetCommentsReq"))
    })
    .superRefine((values, context) => {
      if (!values.giveToGetEnabled) {
        return;
      }

      if (values.giveToGetVotesReq <= 0 && values.giveToGetCommentsReq <= 0) {
        context.addIssue({
          code: "custom",
          path: ["giveToGetVotesReq"],
          message: t("validation.giveToGetMinimumRule")
        });
        context.addIssue({
          code: "custom",
          path: ["giveToGetCommentsReq"],
          message: t("validation.giveToGetMinimumRule")
        });
      }
    });
}

type BoardSettingsFormValues = {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  isPublic: boolean;
  allowAnonymousVotes: boolean;
  giveToGetEnabled: boolean;
  giveToGetVotesReq: number;
  giveToGetCommentsReq: number;
};

export function BoardSettingsPageContent({ slug }: BoardSettingsPageContentProps) {
  const t = useTranslations("BoardSettingsPage");
  const router = useRouter();
  const { user, refreshBoards } = useAuth();

  const [boardId, setBoardId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const boardSettingsSchema = useMemo(() => createBoardSettingsSchema(t), [t]);

  const boardSettingsResolver: Resolver<BoardSettingsFormValues> = async (values) => {
    const result = boardSettingsSchema.safeParse(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {}
      } as const;
    }

    const flatErrors = result.error.flatten().fieldErrors;
    const errors = Object.entries(flatErrors).reduce<Record<string, { type: string; message: string }>>(
      (accumulator, [key, messages]) => {
        const message = messages?.[0];

        if (!message) {
          return accumulator;
        }

        accumulator[key] = {
          type: "manual",
          message
        };

        return accumulator;
      },
      {}
    );

    return {
      values: {} as Record<string, never>,
      errors: errors as never
    };
  };

  const form = useForm<BoardSettingsFormValues>({
    resolver: boardSettingsResolver,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logoUrl: "",
      primaryColor: "",
      isPublic: false,
      allowAnonymousVotes: false,
      giveToGetEnabled: false,
      giveToGetVotesReq: 2,
      giveToGetCommentsReq: 2
    }
  });

  useEffect(() => {
    let cancelled = false;

    const loadBoard = async () => {
      setLoading(true);
      setNotFound(false);
      setForbidden(false);

      try {
        const board = await boardService.getBoardBySlug(slug);

        if (cancelled) {
          return;
        }

        const canManage = Boolean(user?.id && user.id === board.ownerId);

        if (!canManage) {
          setForbidden(true);
          return;
        }

        setBoardId(board.id);
        setOwnerId(board.ownerId);

        form.reset({
          name: board.name,
          slug: board.slug,
          description: board.description ?? "",
          logoUrl: board.logoUrl ?? "",
          primaryColor: board.primaryColor ?? "",
          isPublic: board.isPublic ?? false,
          allowAnonymousVotes: board.allowAnonymousVotes ?? false,
          giveToGetEnabled: board.giveToGetEnabled ?? false,
          giveToGetVotesReq: board.giveToGetVotesReq ?? 2,
          giveToGetCommentsReq: board.giveToGetCommentsReq ?? 2
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof UnauthorizedError) {
          router.replace("/login");
          return;
        }

        setNotFound(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadBoard();

    return () => {
      cancelled = true;
    };
  }, [form, router, slug, user?.id]);

  const onSubmit: SubmitHandler<BoardSettingsFormValues> = async (values) => {
    if (!boardId) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedBoard = await boardService.updateBoard(boardId, {
        name: values.name,
        slug: values.slug,
        description: values.description?.trim() ? values.description.trim() : null,
        logoUrl: values.logoUrl?.trim() ? values.logoUrl.trim() : null,
        primaryColor: values.primaryColor?.trim() ? values.primaryColor.trim() : null,
        ownerId: ownerId ?? undefined,
        isPublic: values.isPublic,
        allowAnonymousVotes: values.allowAnonymousVotes,
        giveToGetEnabled: values.giveToGetEnabled,
        giveToGetVotesReq: values.giveToGetEnabled ? values.giveToGetVotesReq : 0,
        giveToGetCommentsReq: values.giveToGetEnabled ? values.giveToGetCommentsReq : 0
      });

      await refreshBoards();

      toast.success(t("saved"));
      router.replace(`/board/${updatedBoard.slug}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("saveFailed"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return null;
  }

  if (notFound) {
    return (
      <main className="min-h-svh bg-background">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="text-muted-foreground">{t("notFound")}</p>
          </div>
        </div>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="min-h-svh bg-background">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md rounded-xl border border-dashed bg-card p-8 text-center">
            <p className="text-muted-foreground">{t("forbidden")}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6 pb-10 md:p-8 md:pb-12">
        <section className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/board/${slug}`}>{t("backToDashboard")}</Link>
          </Button>
        </section>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{t("sections.profile")}</h2>
                <p className="text-sm text-muted-foreground">{t("sections.profileDescription")}</p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel>{t("fields.name")}</FieldLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.name")}
                          {...field}
                          onChange={(event) => {
                            const name = event.target.value;
                            field.onChange(name);

                            if (!form.formState.dirtyFields.slug) {
                              form.setValue("slug", slugify(name, true), {
                                shouldValidate: true,
                                shouldDirty: false
                              });
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel>{t("fields.slug")}</FieldLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.slug")}
                          {...field}
                          onChange={(event) => field.onChange(slugify(event.target.value, true))}
                        />
                      </FormControl>
                      <FieldDescription>{t("hints.slug")}</FieldDescription>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel>{t("fields.description")}</FieldLabel>
                      <FormControl>
                        <Textarea placeholder={t("placeholders.description")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel>{t("fields.logoUrl")}</FieldLabel>
                      <FormControl>
                        <Input placeholder={t("placeholders.logoUrl")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel>{t("fields.primaryColor")}</FieldLabel>
                      <FormControl>
                        <ColorPicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </Field>
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{t("sections.permissions")}</h2>
              </div>

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem>
                    <Field orientation="horizontal" className="items-center justify-between gap-4">
                      <label htmlFor="is-public" className="flex flex-1 cursor-pointer items-center gap-3">
                        <div className="flex-1">
                          <p className="cursor-pointer text-sm font-medium leading-none">{t("fields.isPublic")}</p>
                          <FieldDescription>{t("hints.isPublic")}</FieldDescription>
                        </div>
                      </label>
                      <FormControl>
                        <Checkbox
                          id="is-public"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          className="cursor-pointer"
                        />
                      </FormControl>
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowAnonymousVotes"
                render={({ field }) => (
                  <FormItem>
                    <Field orientation="horizontal" className="items-center justify-between gap-4">
                      <label htmlFor="allow-anonymous-votes" className="flex flex-1 cursor-pointer items-center gap-3">
                        <div className="flex-1">
                          <p className="cursor-pointer text-sm font-medium leading-none">{t("fields.allowAnonymousVotes")}</p>
                          <FieldDescription>{t("hints.allowAnonymousVotes")}</FieldDescription>
                        </div>
                      </label>
                      <FormControl>
                        <Checkbox
                          id="allow-anonymous-votes"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          className="cursor-pointer"
                        />
                      </FormControl>
                    </Field>
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{t("sections.giveToGet")}</h2>
              </div>

              <FormField
                control={form.control}
                name="giveToGetEnabled"
                render={({ field }) => (
                  <FormItem>
                    <Field orientation="horizontal" className="items-center justify-between gap-4">
                      <label htmlFor="give-to-get-enabled" className="flex flex-1 cursor-pointer items-center gap-3">
                        <div className="flex-1">
                          <p className="cursor-pointer text-sm font-medium leading-none">{t("fields.giveToGetEnabled")}</p>
                          <FieldDescription>{t("hints.giveToGetEnabled")}</FieldDescription>
                        </div>
                      </label>
                      <FormControl>
                        <Checkbox
                          id="give-to-get-enabled"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          className="cursor-pointer"
                        />
                      </FormControl>
                    </Field>
                  </FormItem>
                )}
              />

              {form.watch("giveToGetEnabled") && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="giveToGetVotesReq"
                    render={({ field }) => (
                      <FormItem>
                        <Field>
                          <FieldLabel>{t("fields.giveToGetVotesReq")}</FieldLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="giveToGetCommentsReq"
                    render={({ field }) => (
                      <FormItem>
                        <Field>
                          <FieldLabel>{t("fields.giveToGetCommentsReq")}</FieldLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </section>

            <div className="flex flex-wrap justify-end gap-2 border-t pt-6">
              <Button asChild type="button" variant="outline">
                <Link href={`/board/${slug}`}>{t("actions.cancel")}</Link>
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? t("actions.saving") : t("actions.save")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
}
