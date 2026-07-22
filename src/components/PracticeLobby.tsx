"use client";

import { Loader2, Shuffle, X } from "lucide-react";
import { CallHistory } from "@/components/CallHistory";
import { OnlineList } from "@/components/OnlineList";
import { RoomPicker } from "@/components/RoomPicker";
import { getRoom } from "@/lib/rooms";
import { CallHistoryEntry, PresenceUser, RoomId, SessionKind, UserProfile } from "@/types";

export type PracticeLobbyPhase = "idle" | "looking" | "outgoing";

interface PracticeLobbyProps {
  profile: UserProfile;
  roomId: RoomId;
  statusLabel: string;
  ready: boolean;
  phase: PracticeLobbyPhase;
  users: PresenceUser[];
  history?: CallHistoryEntry[];
  error?: string | null;
  banner?: string | null;
  outgoingUserId?: string | null;
  outgoingKind?: SessionKind | null;
  onRoomChange?: (roomId: RoomId) => void;
  onFindPartner?: () => void;
  onCancelLooking?: () => void;
  onCancelOutgoing?: () => void;
  onCall?: (user: PresenceUser) => void;
  onChat?: (user: PresenceUser) => void;
  /** Non-interactive scaled replica for the guide */
  preview?: boolean;
}

export function PracticeLobby({
  profile,
  roomId,
  statusLabel,
  ready,
  phase,
  users,
  history = [],
  error,
  banner,
  outgoingUserId,
  outgoingKind,
  onRoomChange,
  onFindPartner,
  onCancelLooking,
  onCancelOutgoing,
  onCall,
  onChat,
  preview = false,
}: PracticeLobbyProps) {
  const busy = phase !== "idle";
  const looking = phase === "looking";
  const room = getRoom(roomId);
  const onlineCount = users.length;

  return (
    <div
      className={`mx-auto w-full max-w-2xl ${preview ? "p-6 sm:p-8" : ""}`}
    >
      {/* <header className="animate-[fade-up_0.55s_ease-out_both]">
        <div className="mb-6 inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full bg-[var(--page-surface)]/75 px-3.5 py-1.5 text-sm ring-1 ring-[var(--page-border)] backdrop-blur-md">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              ready
                ? "bg-teal-500 animate-[status-breathe_2.4s_ease-out_infinite]"
                : "bg-amber-400 animate-pulse"
            }`}
          />
          <span className="font-medium text-stone-800 dark:text-stone-100">
            {profile.displayName}
          </span>
          <span className="text-stone-300 dark:text-stone-600">·</span>
          <span className="text-stone-500 dark:text-stone-400">
            {profile.learning} · {profile.level}
          </span>
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

        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
          Live {profile.learning}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-stone-900 sm:text-[3.25rem] sm:leading-[1.05] dark:text-stone-50">
          Who will you
          <br className="hidden sm:block" /> practice with?
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-stone-500 dark:text-stone-400">
          Pick a topic, then call or chat with someone online — or get matched
          near your level.
        </p>
      </header> */}

      <section className="mt-9 animate-[fade-up_0.6s_ease-out_0.05s_both]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
            Topic
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {room.blurb}
          </p>
        </div>
        <div className="mt-3">
          <RoomPicker
            value={roomId}
            onChange={onRoomChange ?? (() => undefined)}
            disabled={busy || preview}
            preview={preview}
          />
        </div>
      </section>

      <section className="mt-11 animate-[fade-up_0.65s_ease-out_0.1s_both]">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              Available now
            </h2>
            <p className="mt-1 text-sm text-stone-400">
              Call for audio, or chat for text · private 1-on-1
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--page-surface)] px-2.5 py-1 text-xs font-medium tabular-nums text-stone-500 ring-1 ring-[var(--page-border)] dark:text-stone-300">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                onlineCount > 0 ? "bg-teal-500" : "bg-stone-400"
              }`}
            />
            {onlineCount} online
          </span>
        </div>

        <OnlineList
          users={users}
          myLevel={profile.level}
          onCall={onCall ?? (() => undefined)}
          onChat={onChat}
          disabled={!ready || busy || preview}
          connecting={!ready && !error}
          outgoingUserId={phase === "outgoing" ? outgoingUserId : null}
          outgoingKind={phase === "outgoing" ? outgoingKind : null}
          onCancelOutgoing={onCancelOutgoing}
        />
      </section>

      <section
        className={`relative mt-10 overflow-hidden rounded-[1.85rem] px-5 py-6 ring-1 transition sm:px-7 sm:py-7 animate-[fade-up_0.7s_ease-out_0.14s_both] ${
          looking
            ? "bg-teal-500/[0.08] ring-teal-600/20 dark:bg-teal-400/[0.08] dark:ring-teal-400/25"
            : "bg-[var(--page-surface)]/85 ring-[var(--page-border)]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className={`absolute -right-12 top-[-40%] h-44 w-44 rounded-full blur-3xl ${
              looking
                ? "bg-teal-400/30 animate-[match-pulse_2.2s_ease-in-out_infinite]"
                : "bg-teal-400/15 dark:bg-teal-400/10"
            }`}
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(15,118,110,0.04)_100%)] dark:bg-[linear-gradient(135deg,transparent_40%,rgba(45,212,191,0.05)_100%)]" />
        </div>

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              {looking ? "Searching" : "Quick match"}
            </p>
            <p className="mt-1.5 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              {looking
                ? "Looking for a partner…"
                : phase === "outgoing"
                  ? banner ?? "Calling…"
                  : `Match in ${room.name}`}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              {looking
                ? "Connecting you with someone near your level."
                : "No one to call? We’ll find a partner for you."}
            </p>

            {error ? (
              <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                {error}
              </p>
            ) : null}
            {banner && phase !== "outgoing" && phase !== "looking" ? (
              <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">
                {banner}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            {looking ? (
              <button
                type="button"
                onClick={onCancelLooking}
                tabIndex={preview ? -1 : undefined}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-stone-900 px-6 text-sm font-semibold text-white shadow-[0_14px_30px_-16px_rgba(15,118,110,0.7)] transition hover:bg-teal-800 dark:bg-teal-400 dark:text-stone-950 dark:hover:bg-teal-300"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Cancel
                <X className="h-4 w-4 opacity-50" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!ready || busy}
                onClick={onFindPartner}
                tabIndex={preview ? -1 : undefined}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-stone-900 px-6 text-sm font-semibold text-white shadow-[0_14px_30px_-16px_rgba(15,118,110,0.55)] transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none dark:bg-teal-400 dark:text-stone-950 dark:shadow-[0_14px_30px_-16px_rgba(45,212,191,0.4)] dark:hover:bg-teal-300"
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
                Cancel invite
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="animate-[fade-up_0.75s_ease-out_0.18s_both]">
        <CallHistory entries={history} preview={preview} />
      </div>
    </div>
  );
}
