"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { authService } from "@/features/authentication/services/authService";
import { resolveAuthenticatedRedirectPath } from "@/features/authentication/services/authRedirectService";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { toast } from "@/shared/components/ui/sonner";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/shared/components/ui/field";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

function registerSchema(t: (key: string) => string) {
  return z
    .object({
      username: z
        .string()
        .min(3, t("validation.username"))
        .max(30, t("validation.username"))
        .regex(/^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/, t("validation.usernamePattern")),
      displayName: z.string().min(2, t("validation.displayName")),
      email: z.email(t("validation.email")),
      password: z.string().min(8, t("validation.password")),
      confirmPassword: z.string()
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.confirmPassword"),
      path: ["confirmPassword"]
    });
}

type RegisterFormValues = {
  username: string;
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallbackMessage;
}

export default function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("RegisterForm");
  const { push } = useRouter();
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: standardSchemaResolver(registerSchema(t)),
    defaultValues: {
      username: "",
      displayName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const handleGoogleSignUp = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

    const stored = typeof window !== "undefined" ? localStorage.getItem("upquit-locale") : null;
    const browserLang = typeof navigator !== "undefined" ? navigator.language || navigator.languages?.[0] : null;
    const primaryFromBrowser = browserLang ? browserLang.split("-")[0] : null;
    const allowed = ["en", "es", "ca"];
    const locale = stored || (allowed.includes(primaryFromBrowser || "") ? primaryFromBrowser : "en");

    window.location.href = `${backendUrl}/users/auth/google?locale=${encodeURIComponent(locale!)}`;
  };

  useEffect(() => {
    let cancelled = false;

    const redirectAuthenticatedUser = async () => {
      try {
        const destination = await resolveAuthenticatedRedirectPath();

        if (!cancelled) {
          window.location.replace(destination);
        }
      } catch {}
    };

    void redirectAuthenticatedUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const submitData = {
        username: data.username,
        displayName: data.displayName,
        email: data.email,
        password: data.password
      };
      await authService.register(submitData);

      toast.success(t("success.created"));
      push("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, t("errors.generic")));
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      return;
    }

    setIsCheckingUsername(true);

    try {
      const response = await authService.checkUsernameAvailability(normalizedUsername);
      if (!response.available) {
        form.setError("username", { message: t("validation.usernameTaken") });
      }
    } catch (error) {
      if (error instanceof Error) {
        form.setError("username", { message: error.message });
      }
    } finally {
      setIsCheckingUsername(false);
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
                  <p className="text-sm text-balance text-muted-foreground">{t("subtitle")}</p>
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Field>
                        <FieldLabel htmlFor="username">{t("fields.username.label")}</FieldLabel>
                        <FormControl>
                          <Input
                            id="username"
                            placeholder={t("fields.username.placeholder")}
                            autoComplete="username"
                            {...field}
                            onChange={(event) => {
                              field.onChange(event.target.value.toLowerCase());
                              form.clearErrors("username");
                            }}
                            onBlur={(event) => {
                              field.onBlur();
                              void checkUsernameAvailability(event.target.value);
                            }}
                          />
                        </FormControl>
                        <FieldDescription>{t("fields.username.description")}</FieldDescription>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Field>
                        <FieldLabel htmlFor="displayName">{t("fields.displayName.label")}</FieldLabel>
                        <FormControl>
                          <Input
                            id="displayName"
                            placeholder={t("fields.displayName.placeholder")}
                            autoComplete="name"
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

                <Field className="grid grid-cols-2 gap-4">
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
                </Field>

                <Field>
                  <Button type="submit" disabled={form.formState.isSubmitting || isCheckingUsername}>
                    {form.formState.isSubmitting || isCheckingUsername ? t("actions.creating") : t("actions.create")}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  {t("orContinueWith")}
                </FieldSeparator>

                <Field>
                  <Button variant="outline" type="button" className="hover:cursor-pointer" onClick={handleGoogleSignUp}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    {t("signUpWithGoogle")}
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  {t("alreadyHaveAccount")}{" "}
                  <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                    {t("actions.signIn")}
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

      <FieldDescription className="px-6 text-center">
        {t("terms.prefix")}{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
          {t("terms.termsOfService")}
        </Link>{" "}
        {t("terms.and")}{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
          {t("terms.privacyPolicy")}
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
