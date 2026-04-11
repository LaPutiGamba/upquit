"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { boardService } from "@/features/boards/services/boardService";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { toast } from "@/shared/components/ui/sonner";

const createBoardSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones."),
  description: z.string().optional()
});

type CreateBoardFormValues = z.infer<typeof createBoardSchema>;

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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateBoardFormValues>({
    // @ts-expect-error - zodResolver type mismatch
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: ""
    }
  });

  const onSubmit = async (data: CreateBoardFormValues) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No estás autenticado.");

      const newBoard = await boardService.createBoard(data, token);

      toast.success("Board creado correctamente.");

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
        toast.error("Error al crear el board.");
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
                <FieldLabel>Nombre del Producto</FieldLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Mi App Increíble"
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
                <FieldLabel>URL / Slug</FieldLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Input
                      placeholder="mi-app"
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
                <FieldLabel>Descripción (Opcional)</FieldLabel>
                <FormControl>
                  <Input placeholder="Un breve resumen de tu proyecto..." {...field} />
                </FormControl>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear Board"}
        </Button>
      </form>
    </Form>
  );
}
