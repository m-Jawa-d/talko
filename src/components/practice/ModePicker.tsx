"use client";

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import {
  PracticeChrome,
  PracticeGate,
} from "@/components/practice/PracticeGate";
import { SiteNavPill } from "@/components/SiteHeader";

export function ModePicker() {
  return (
    <PracticeGate>
      {({ resetProfile }) => (
        <PracticeChrome
          action={
            <>
              <Link
                href="/guide"
                className="hidden text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:inline dark:text-stone-400 dark:hover:text-stone-100"
              >
                Guide
              </Link>
              <SiteNavPill onClick={resetProfile}>Edit profile</SiteNavPill>
            </>
          }
        >
          <div className="mx-auto w-full max-w-2xl animate-[fade-up_0.55s_ease-out_both]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
              Practice
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-stone-900 sm:text-[3.25rem] sm:leading-[1.05] dark:text-stone-50">
              How do you want
              <br className="hidden sm:block" /> to practice?
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-stone-500 dark:text-stone-400">
              Pick a mode. Calls are audio-only; chats keep a Messenger-style
              history of your conversations.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link
                href="/practice/call"
                className="group relative overflow-hidden rounded-[1.85rem] bg-[var(--page-surface)] p-6 ring-1 ring-[var(--page-border)] transition hover:-translate-y-0.5 hover:ring-teal-700/30 dark:hover:ring-teal-400/35 sm:p-7"
              >
                <div className="pointer-events-none absolute -right-8 top-[-30%] h-36 w-36 rounded-full bg-teal-400/15 blur-3xl transition group-hover:bg-teal-400/25" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  <Phone className="h-5 w-5" />
                </div>
                <h2 className="relative mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                  Call
                </h2>
                <p className="relative mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                  Live 1-on-1 audio. Mute, prompts, and find a partner near your
                  level.
                </p>
              </Link>

              <Link
                href="/practice/chat"
                className="group relative overflow-hidden rounded-[1.85rem] bg-[var(--page-surface)] p-6 ring-1 ring-[var(--page-border)] transition hover:-translate-y-0.5 hover:ring-teal-700/30 dark:hover:ring-teal-400/35 sm:p-7"
              >
                <div className="pointer-events-none absolute -right-8 top-[-30%] h-36 w-36 rounded-full bg-sky-400/15 blur-3xl transition group-hover:bg-sky-400/25" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-800 dark:text-sky-300">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h2 className="relative mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                  Chat
                </h2>
                <p className="relative mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                  Text practice with conversation threads you can reopen anytime.
                </p>
              </Link>
            </div>
          </div>
        </PracticeChrome>
      )}
    </PracticeGate>
  );
}
