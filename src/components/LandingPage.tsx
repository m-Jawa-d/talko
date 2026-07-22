import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader, SiteNavPill } from "@/components/SiteHeader";

const steps = [
  {
    n: "01",
    title: "Say who you are",
    body: "A display name and your level. Saved on this device — nothing else.",
  },
  {
    n: "02",
    title: "Find someone to talk to",
    body: "Match instantly, or call a learner who’s already online.",
  },
  {
    n: "03",
    title: "Speak — for real",
    body: "Private 1-on-1 audio. No chat bots. No scripts. Just conversation.",
  },
] as const;

const reasons = [
  {
    title: "Real people only",
    body: "Every call is with another learner. You hear natural speech, pace, and hesitation — the things apps can’t fake.",
  },
  {
    title: "Private by design",
    body: "Audio travels peer-to-peer. No recordings, no accounts, no audience watching you practice.",
  },
  {
    title: "Start in seconds",
    body: "Open Talko, join the lobby, and speak. The barrier isn’t signup — it’s pressing start.",
  },
] as const;

/**
 * Premium landing: full-bleed photo hero, then one-job sections.
 * Brand stays the hero signal; no inset media cards or floating frames.
 */
export function LandingPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[var(--page-bg)]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-[100dvh] flex-col overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_40%] scale-110 animate-[hero-drift_28s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--hero-wash)] via-[color-mix(in_srgb,var(--hero-wash)_92%,transparent)] to-[color-mix(in_srgb,var(--hero-wash)_25%,transparent)] sm:via-[color-mix(in_srgb,var(--hero-wash)_88%,transparent)] sm:to-transparent lg:from-[var(--hero-wash)] lg:via-[color-mix(in_srgb,var(--hero-wash)_65%,transparent)] lg:to-transparent dark:via-[color-mix(in_srgb,var(--hero-wash)_88%,transparent)] dark:to-[color-mix(in_srgb,var(--hero-wash)_35%,transparent)] lg:dark:via-[color-mix(in_srgb,var(--hero-wash)_72%,transparent)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-wash)] from-0% via-[color-mix(in_srgb,var(--hero-wash)_75%,transparent)] via-8% to-transparent to-22%" />
          <div className="absolute inset-0 bg-gradient-to-b from-[color-mix(in_srgb,var(--hero-wash)_45%,transparent)] via-transparent to-transparent" />
          <div className="absolute inset-0 hidden bg-stone-950/35 dark:block" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-7 sm:px-10 lg:px-12">
          <SiteHeader
            action={
              <>
                <Link
                  href="/guide"
                  className="hidden text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:inline dark:text-stone-400 dark:hover:text-stone-100"
                >
                  Guide
                </Link>
                <SiteNavPill href="/practice">Practice</SiteNavPill>
              </>
            }
          />

          <div className="flex flex-1 flex-col justify-center py-16 sm:py-20 lg:max-w-xl lg:py-0">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.22em] text-teal-800 animate-[fade-up_0.7s_ease-out_0.08s_both] dark:text-teal-300">
              Speak with real people
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[1.02] font-semibold tracking-tight text-stone-900 animate-[fade-up_0.75s_ease-out_0.14s_both] sm:text-6xl lg:text-7xl dark:text-stone-50">
              Talko
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-stone-600 animate-[fade-up_0.75s_ease-out_0.22s_both] sm:text-xl dark:text-stone-300">
              Practice English in live 1-on-1 audio calls. Find a partner
              instantly, or choose someone online.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4 animate-[fade-up_0.75s_ease-out_0.3s_both]">
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-teal-200"
              >
                Start practicing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/guide"
                className="text-sm font-medium text-stone-600 underline-offset-4 transition hover:text-stone-900 hover:underline dark:text-stone-400 dark:hover:text-stone-100"
              >
                How it works
              </Link>
            </div>
            <p className="mt-5 text-sm text-stone-500 animate-[fade-up_0.75s_ease-out_0.36s_both] dark:text-stone-400">
              No account · microphone required
            </p>
          </div>

          <div className="pb-8 animate-[fade-up_0.8s_ease-out_0.5s_both]">
            <a
              href="#why"
              className="group inline-flex flex-col items-start gap-2 text-stone-500 transition hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            >
              <span className="text-xs font-medium uppercase tracking-[0.2em]">
                Scroll
              </span>
              <span className="block h-8 w-px origin-top bg-current transition group-hover:scale-y-110" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Why speaking wins ────────────────────────────────── */}
      <section
        id="why"
        className="relative border-t border-[var(--page-border)] bg-[var(--page-bg)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_0%,var(--accent-soft),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
              Why Talko
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15] dark:text-stone-50">
              Fluency isn’t studied.
              <br className="hidden sm:block" /> It’s spoken.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-500 sm:text-lg dark:text-stone-400">
              Lessons teach you words. Conversation teaches you to use them —
              under pressure, with a real voice on the other end.
            </p>
          </div>

          <div className="mt-16 grid gap-12 sm:grid-cols-3 sm:gap-10">
            {reasons.map((item, i) => (
              <div
                key={item.title}
                className="animate-[fade-up_0.7s_ease-out_both]"
                style={{ animationDelay: `${0.08 + i * 0.08}s` }}
              >
                <p className="text-xs font-semibold tracking-[0.16em] text-teal-700/80 dark:text-teal-400/90">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="border-t border-[var(--page-border)] bg-[var(--page-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28 lg:px-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
                How it works
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
                From quiet to speaking in three steps
              </h2>
            </div>
            <Link
              href="/guide"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-stone-600 transition hover:text-teal-700 dark:text-stone-400 dark:hover:text-teal-300"
            >
              Full walkthrough
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ol className="mt-14 divide-y divide-[var(--page-border)] border-y border-[var(--page-border)]">
            {steps.map((step) => (
              <li
                key={step.n}
                className="grid gap-4 py-8 sm:grid-cols-[5rem_1fr] sm:gap-10 sm:py-10"
              >
                <span className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-300 dark:text-stone-600">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-50">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone-500 sm:text-base dark:text-stone-400">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Closing CTA (full-bleed practice moment) ─────────── */}
      <section className="relative overflow-hidden border-t border-[var(--page-border)]">
        <div className="absolute inset-0">
          <Image
            src="/practice-moment.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[58%_35%] scale-105 animate-[hero-drift_32s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-stone-950/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/55 to-stone-950/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/40" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32 lg:px-12">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-teal-300">
              Ready when you are
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Your next conversation is one click away
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-stone-300">
              Join the live lobby, find a partner, and start speaking English —
              no signup wall, no waiting list.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 transition hover:bg-teal-200"
              >
                Start practicing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
