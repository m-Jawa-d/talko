"use client";

import { Loader2, Shuffle, X } from "lucide-react";
import { OnlineList } from "@/components/OnlineList";
import { PresenceUser, UserProfile } from "@/types";

export type PracticeLobbyPhase = "idle" | "looking" | "outgoing";

interface PracticeLobbyProps {
  profile: UserProfile;
  statusLabel: string;
  ready: boolean;
  phase: PracticeLobbyPhase;
  users: PresenceUser[];
  error?: string | null;
  banner?: string | null;
  onFindPartner?: () => void;
  onCancelLooking?: () => void;
  onCancelOutgoing?: () => void;
  onCall?: (user: PresenceUser) => void;
  /** Non-interactive scaled replica for the guide */
  preview?: boolean;
}

export function PracticeLobby({
  profile,
  statusLabel,
  ready,
  phase,
  users,
  error,
  banner,
  onFindPartner,
  onCancelLooking,
  onCancelOutgoing,
  onCall,
  preview = false,
}: PracticeLobbyProps) {
  const busy = phase !== "idle";

  return (
    <div
      className={`grid items-start gap-14 lg:grid-cols-2 lg:gap-20 ${
        preview ? "p-8 lg:p-10" : ""
      }`}
    >
      <section>
        <div className="mb-10 inline-flex items-center gap-2 rounded-full bg-[var(--page-surface)] px-3.5 py-1.5 text-xs text-stone-500 ring-1 ring-[var(--page-border)] dark:text-stone-400">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              ready ? "bg-teal-500" : "bg-amber-400"
            }`}
          />
          {profile.displayName}
          <span className="text-stone-300 dark:text-stone-600">·</span>
          {profile.level}
          <span className="text-stone-300 dark:text-stone-600">·</span>
          <span
            className={
              ready
                ? "text-teal-700 dark:text-teal-300"
                : "text-amber-700 dark:text-amber-300"
            }
          >
            {statusLabel}
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
          Find someone
          <br className="hidden sm:block" /> to practice with
        </h1>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-stone-500 dark:text-stone-400">
          Match instantly, or pick a learner from who’s online.
        </p>

        {error ? (
          <p className="mt-6 text-sm text-amber-700 dark:text-amber-300">{error}</p>
        ) : null}

        {banner ? (
          <p className="mt-6 text-sm text-stone-600 dark:text-stone-300">{banner}</p>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          {phase === "looking" ? (
            <button
              type="button"
              onClick={onCancelLooking}
              tabIndex={preview ? -1 : undefined}
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800 dark:bg-teal-400 dark:text-stone-950 dark:hover:bg-teal-300"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching
              <X className="h-4 w-4 opacity-60" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!ready || busy}
              onClick={onFindPartner}
              tabIndex={preview ? -1 : undefined}
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-teal-400 dark:text-stone-950 dark:hover:bg-teal-300"
            >
              <Shuffle className="h-4 w-4" />
              Find a partner
            </button>
          )}

          {phase === "outgoing" ? (
            <button
              type="button"
              onClick={onCancelOutgoing}
              tabIndex={preview ? -1 : undefined}
              className="text-sm font-medium text-stone-500 underline-offset-4 transition hover:text-stone-800 hover:underline dark:text-stone-400 dark:hover:text-stone-200"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-3xl bg-[var(--page-surface)] p-6 ring-1 ring-[var(--page-border)] sm:p-8 lg:rounded-none lg:bg-transparent lg:p-0 lg:ring-0 lg:border-l lg:border-[var(--page-border)] lg:pl-16">
        <OnlineList
          users={users}
          onCall={onCall ?? (() => undefined)}
          disabled={!ready || busy || preview}
          connecting={!ready && !error}
        />
      </section>
    </div>
  );
}
