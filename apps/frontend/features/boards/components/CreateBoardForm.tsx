"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { boardService } from "@/features/boards/services/boardService";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { toast } from "@/shared/components/ui/sonner";

function createBoardSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(3, t("validation.nameMin")),
    slug: z
      .string()
      .min(3, t("validation.slugMin"))
      .regex(/^[a-z0-9-]+$/, t("validation.slugPattern")),
    description: z.string().optional()
  });
}

type CreateBoardFormValues = {
  name: string;
  slug: string;
  description?: string;
};

interface CreateBoardFormProps {
  onSuccess?: (createdBoardSlug: string) => void | Promise<void>;
}

function slugify(value: string, keepTrailingHyphen = false): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "");

  if (keepTrailingHyphen) {
    return normalized;
  }

  return normalized.replace(/-+$/, "");
}

export function CreateBoardForm({ onSuccess }: CreateBoardFormProps) {
  const t = useTranslations("CreateBoardForm");
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateBoardFormValues>({
    // @ts-expect-error - zodResolver type mismatch
    resolver: zodResolver(createBoardSchema(t)),
    defaultValues: {
      name: "",
      slug: "",
      description: ""
    }
  });

  const onSubmit = async (data: CreateBoardFormValues) => {
    setIsLoading(true);
    try {
      const newBoard = await boardService.createBoard(data);

      toast.success(t("success.created"));

      if (onSuccess) {
        await onSuccess(newBoard.slug);
      } else {
        router.push(`/board/${newBoard.slug}`);
      }

      form.reset({
        name: "",
        slug: "",
        description: ""
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("errors.createFailed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel>{t("fields.name.label")}</FieldLabel>
                <FormControl>
                  <Input
                    placeholder={t("fields.name.placeholder")}
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
                <FieldLabel>{t("fields.slug.label")}</FieldLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Input
                      placeholder={t("fields.slug.placeholder")}
                      {...field}
                      className="rounded-r-none"
                      onChange={(event) => {
                        field.onChange(slugify(event.target.value, true));
                      }}
                    />
                    <span className="bg-muted border border-l-0 px-3 py-2 text-sm text-muted-foreground rounded-r-md">
                      .upquit.com
                    </span>
                  </div>
                </FormControl>
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
                <FieldLabel>{t("fields.description.label")}</FieldLabel>
                <FormControl>
                  <Input placeholder={t("fields.description.placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full hover:cursor-pointer" disabled={isLoading}>
          {isLoading ? t("actions.creating") : t("actions.create")}
        </Button>
      </form>
    </Form>
  );
}
