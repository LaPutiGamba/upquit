import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LegalPages");

  return {
    title: t("privacy.title"),
    description: t("privacy.description")
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("LegalPages");

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 px-6 py-16 sm:px-8 lg:px-12">
      <header className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">{t("eyebrow")}</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t("privacy.title")}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{t("privacy.description")}</p>
      </header>

      <section className="grid gap-6 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">{t("shared.collection.title")}</h2>
          <p className="text-sm leading-7 text-muted-foreground">{t("privacy.collection")}</p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">{t("shared.usage.title")}</h2>
          <p className="text-sm leading-7 text-muted-foreground">{t("privacy.usage")}</p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">{t("shared.rights.title")}</h2>
          <p className="text-sm leading-7 text-muted-foreground">{t("privacy.rights")}</p>
        </div>
      </section>
    </main>
  );
}
