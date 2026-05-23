"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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

function forgotPasswordSchema(t: (key: string) => string) {
  return z.object({
    email: z.email(t("validation.email"))
  });
}

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("ForgotPasswordForm");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema(t)),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await authService.requestPasswordReset(data.email);
      setIsSubmitted(true);
      toast.success(t("success.emailSent"));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("errors.generic");
      toast.error(errorMessage);
    }
  };

  if (isSubmitted) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <FieldGroup>
                <div className="flex flex-col items-center gap-4 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg
                      className="size-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <h1 className="text-2xl font-semibold">{t("success.title")}</h1>
                    <FieldDescription className="text-base text-balance mt-2">
                      {t("success.description")}
                    </FieldDescription>
                  </div>
                </div>

                <Field>
                  <Button asChild className="w-full">
                    <Link href="/login">{t("actions.backToLogin")}</Link>
                  </Button>
                </Field>
              </FieldGroup>
            </div>

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
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Field>
                        <FieldLabel htmlFor="email">{t("fields.email.label")}</FieldLabel>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder={t("fields.email.placeholder")}
                            autoComplete="email"
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
                    {form.formState.isSubmitting ? t("actions.sending") : t("actions.sendReset")}
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
