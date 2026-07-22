"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ActiveCall } from "@/components/ActiveCall";
import { IncomingCall } from "@/components/IncomingCall";
import { PracticeLobby } from "@/components/PracticeLobby";
import { ProfileSetup } from "@/components/ProfileSetup";
import { SiteFooter, SiteHeader, SiteNavPill } from "@/components/SiteHeader";
import { UiPreviewFrame } from "@/components/UiPreviewFrame";
import { PresenceUser, UserProfile } from "@/types";

const demoProfile: UserProfile = {
  id: "guide-you",
  displayName: "Alex",
  level: "B1",
  learning: "English",
};

const demoPeer: PresenceUser = {
  id: "guide-peer",
  displayName: "Sam",
  level: "B2",
  learning: "English",
  status: "Online",
};

const demoUsers: PresenceUser[] = [
  demoPeer,
  {
    id: "guide-peer-2",
    displayName: "Jordan",
    level: "A2",
    learning: "English",
    status: "Looking",
  },
];

const noop = () => undefined;

const steps = [
  {
    n: "01",
    title: "Create your profile",
    body: "Enter a display name, pick a language, and your level. It’s saved on this device — no account needed.",
    preview: (
      <UiPreviewFrame scale={0.72}>
        <div className="w-[400px] rounded-2xl bg-[var(--page-bg)] p-2">
          <ProfileSetup preview onSave={noop} />
        </div>
      </UiPreviewFrame>
    ),
  },
  {
    n: "02",
    title: "Find or call a partner",
    body: "Choose a topic, tap Find a partner, or call someone who’s already online.",
    preview: (
      <UiPreviewFrame scale={0.58}>
        <div className="w-[640px] rounded-2xl bg-[var(--page-bg)]">
          <PracticeLobby
            preview
            profile={demoProfile}
            roomId="travel"
            statusLabel="Online"
            ready
            phase="idle"
            users={demoUsers}
          />
        </div>
      </UiPreviewFrame>
    ),
  },
  {
    n: "03",
    title: "Allow your microphone",
    body: "Accept the call, then allow mic access when the browser asks. Headphones help avoid echo.",
    preview: (
      <UiPreviewFrame scale={0.9}>
        <div className="w-[380px]">
          <IncomingCall
            preview
            caller={demoPeer}
            onAccept={noop}
            onDecline={noop}
          />
        </div>
      </UiPreviewFrame>
    ),
  },
  {
    n: "04",
    title: "Practice, mute, or end",
    body: "Speak freely, tap for a new conversation prompt if you need a topic, then End call when you’re done.",
    preview: (
      <UiPreviewFrame scale={0.42}>
        <div className="h-[760px] w-[720px] overflow-hidden rounded-2xl">
          <ActiveCall
            preview
            peerName={demoPeer.displayName}
            peerLevel={demoPeer.level}
            peerLearning={demoPeer.learning}
            roomId="travel"
            localStream={null}
            remoteStream={null}
            connectionState="connected"
            isMuted={false}
            onToggleMute={noop}
            onEndCall={noop}
            previewSeconds={95}
          />
        </div>
      </UiPreviewFrame>
    ),
  },
] as const;

export function GuidePage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[var(--page-bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_0%_0%,var(--accent-soft),transparent_55%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-7 sm:px-10 lg:px-12">
        <SiteHeader
          action={
            <>
              <Link
                href="/guide"
                className="hidden text-sm font-medium text-stone-500 sm:inline dark:text-stone-400"
                aria-current="page"
              >
                Guide
              </Link>
              <SiteNavPill href="/practice">Practice</SiteNavPill>
            </>
          }
        />

        <main className="flex-1 py-14 sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
              How it works
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
              Start speaking in four steps
            </h1>
            <p className="mt-4 text-base leading-relaxed text-stone-500 dark:text-stone-400">
              These previews are the real Talko screens — when the app UI
              changes, this guide updates with it.
            </p>
          </div>

          <ol className="mt-16 grid gap-12 sm:grid-cols-2">
            {steps.map(({ n, title, body, preview }) => (
              <li key={n} className="flex flex-col">
                {preview}
                <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-stone-400">
                  {n}
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                  {title}
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                  {body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-[var(--page-border)] pt-10">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800 dark:bg-teal-400 dark:text-stone-950 dark:hover:bg-teal-300"
            >
              Start practicing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Tip: open two tabs with different names to try a call yourself.
            </p>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
