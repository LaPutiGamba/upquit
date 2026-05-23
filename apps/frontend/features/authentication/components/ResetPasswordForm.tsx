"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { authService } from "@/features/authentication/services/authService";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { toast } from "@/shared/components/ui/sonner";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { useTranslations } from "next-intl";

function resetPasswordSchema(t: (key: string) => string) {
  return z
    .object({
      password: z.string().min(8, t("validation.password")),
      confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.confirmPassword"),
      path: ["confirmPassword"]
    });
}

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  token: string;
}

export default function ResetPasswordForm({ token, className, ...props }: ResetPasswordFormProps) {
  const t = useTranslations("ResetPasswordForm");
  const { push } = useRouter();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema(t)),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await authService.resetPassword(token, data.password);
      toast.success(t("success.passwordReset"));
      push("/login");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-semibold">{t("title")}</h1>
                  <p className="text-balance text-muted-foreground">{t("subtitle")}</p>
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Field>
                        <FieldLabel htmlFor="password">{t("fields.password.label")}</FieldLabel>
                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder={t("fields.password.placeholder")}
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Field>
                        <FieldLabel htmlFor="confirmPassword">{t("fields.confirmPassword.label")}</FieldLabel>
                        <FormControl>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder={t("fields.confirmPassword.placeholder")}
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <Field>
                  <Button type="submit" className="hover:cursor-pointer w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? t("actions.resetting") : t("actions.resetPassword")}
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                    {t("actions.backToLogin")}
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </Form>

          <div className="relative hidden bg-muted md:block">
            <Image
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
