import Link from "next/link";
import { Manrope, Sora } from "next/font/google";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";

import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { LocaleSwitcher } from "@/shared/components/LocaleSwitcher";

const homeDisplay = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"]
});

const homeBody = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export function DefaultHomePage() {
  const t = useTranslations("DefaultHomePage");

  const homeHighlights = [
    {
      title: t("highlights.realtime.title"),
      description: t("highlights.realtime.description")
    },
    {
      title: t("highlights.signal.title"),
      description: t("highlights.signal.description")
    },
    {
      title: t("highlights.multitenancy.title"),
      description: t("highlights.multitenancy.description")
    }
  ];
  const roadmapSteps = [t("roadmapSteps.0"), t("roadmapSteps.1"), t("roadmapSteps.2")];
  const boardFlow = [
    {
      label: t("boardFlow.capture.label"),
      text: t("boardFlow.capture.text")
    },
    {
      label: t("boardFlow.discuss.label"),
      text: t("boardFlow.discuss.text")
    },
    {
      label: t("boardFlow.prioritize.label"),
      text: t("boardFlow.prioritize.text")
    }
  ];

  return (
    <main className="relative isolate min-h-screen overflow-hidden home-atmosphere">
      <div className="absolute inset-0 -z-10 home-grid-pattern" />
      <div className="pointer-events-none absolute inset-0 -z-10 home-grain" />
      <div className="pointer-events-none absolute -left-16 top-16 -z-10 size-72 rounded-full bg-primary/25 blur-3xl home-orb-one" />
      <div className="pointer-events-none absolute -right-16 top-52 -z-10 size-80 rounded-full bg-chart-1/25 blur-3xl home-orb-two" />

      <div className={homeBody.className}>
        <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-16 pt-8 sm:px-10 lg:px-12">
          <header
            className="animate-reveal flex items-center justify-between"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-foreground ring-1 ring-border">
                UQ
              </span>
              <div className="flex flex-col leading-tight">
                <span className={homeDisplay.className + " text-lg font-semibold"}>UpQuit</span>
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{t("header.kicker")}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                <Link href="/register">{t("header.startFree")}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
                <Link href="/login">{t("header.login")}</Link>
              </Button>
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </header>

          <section className="grid flex-1 gap-12 pb-12 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">
            <div className="flex flex-col gap-7">
              <div className="animate-reveal" style={{ "--reveal-delay": "140ms" } as CSSProperties}>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em]">
                  {t("badge")}
                </Badge>
              </div>

              <div
                className="animate-reveal flex flex-col gap-5"
                style={{ "--reveal-delay": "220ms" } as CSSProperties}
              >
                <h1
                  className={
                    homeDisplay.className +
                    " text-balance text-4xl leading-[1.04] tracking-tight text-foreground sm:text-[3.2rem] lg:text-[3.8rem]"
                  }
                >
                  {t("hero.titlePrefix")} <span className="text-gradient-brand">{t("hero.titleHighlight")}</span>.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {t("hero.description")}
                </p>
              </div>

              <div
                className="animate-reveal flex flex-col gap-3 sm:flex-row"
                style={{ "--reveal-delay": "300ms" } as CSSProperties}
              >
                <Button asChild size="lg" className="sm:min-w-44 rounded-full px-6">
                  <Link href="/register">{t("hero.primaryCta")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="sm:min-w-44 rounded-full px-6">
                  <Link href="/login">{t("hero.secondaryCta")}</Link>
                </Button>
              </div>

              <div
                className="animate-reveal flex flex-wrap gap-5 border-t border-border/70 pt-5"
                style={{ "--reveal-delay": "360ms" } as CSSProperties}
              >
                <p className="text-sm text-muted-foreground">{t("proofs.0")}</p>
                <p className="text-sm text-muted-foreground">{t("proofs.1")}</p>
                <p className="text-sm text-muted-foreground">{t("proofs.2")}</p>
              </div>
            </div>

            <div
              className="animate-reveal border-l border-border/70 pl-6 lg:pl-8"
              style={{ "--reveal-delay": "260ms" } as CSSProperties}
            >
              <h2 className={homeDisplay.className + " text-2xl tracking-tight text-foreground"}>{t("flow.title")}</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("flow.description")}</p>

              <div className="mt-6 flex flex-col gap-6">
                {boardFlow.map((step) => (
                  <div key={step.label} className="flex gap-4">
                    <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <div>
                      <p className={homeDisplay.className + " text-base text-foreground"}>{step.label}</p>
                      <p className="pt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className="animate-reveal border-t border-border/70 pt-8"
            style={{ "--reveal-delay": "420ms" } as CSSProperties}
          >
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className={homeDisplay.className + " text-xl tracking-tight text-foreground"}>
                  {t("usage.title")}
                </h3>
                <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm leading-6 text-muted-foreground">
                  {roadmapSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              {homeHighlights.map((highlight) => (
                <div key={highlight.title}>
                  <h3 className={homeDisplay.className + " text-xl tracking-tight text-foreground"}>
                    {highlight.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{highlight.description}</p>
                </div>
              ))}
            </div>
          </section>

          <footer className="animate-reveal pt-8" style={{ "--reveal-delay": "500ms" } as CSSProperties}>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("footer.kicker")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("footer.text")}</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
