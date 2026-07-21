import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter, SiteHeader, SiteNavPill } from "@/components/SiteHeader";

/**
 * Premium landing pattern: photo is the full-bleed visual plane.
 * Copy sits in a soft left wash — no inset cards, ovals, or floating frames.
 */
export function LandingPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[var(--page-bg)]">
      <div className="absolute inset-0">
        <Image
          src="/bannerImg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_42%] scale-110 animate-[hero-drift_28s_ease-in-out_infinite_alternate]"
        />
        {/* Light wash */}
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

        <section className="flex flex-1 flex-col justify-center py-16 sm:py-20 lg:max-w-xl lg:py-0">
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
            <p className="text-sm text-stone-500 dark:text-stone-400">
              No account · microphone required
            </p>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
}
