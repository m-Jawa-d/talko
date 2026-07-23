"use client";

import { Loader2, MessageCircle, Phone, Users, X } from "lucide-react";
import { isNearLevel } from "@/lib/levels";
import {
  LanguageLevel,
  PresenceStatus,
  PresenceUser,
  PracticeMode,
} from "@/types";

interface OnlineListProps {
  users: PresenceUser[];
  mode: PracticeMode;
  onConnect: (user: PresenceUser) => void;
  disabled?: boolean;
  connecting?: boolean;
  myLevel?: LanguageLevel;
  outgoingUserId?: string | null;
  onCancelOutgoing?: () => void;
}

const AVATAR_TONES = [
  "bg-teal-500/15 text-teal-800 dark:text-teal-200",
  "bg-sky-500/15 text-sky-800 dark:text-sky-200",
  "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  "bg-rose-500/12 text-rose-800 dark:text-rose-200",
  "bg-stone-500/15 text-stone-700 dark:text-stone-200",
] as const;

function statusDot(status: PresenceStatus) {
  switch (status) {
    case "Online":
      return "bg-teal-500 animate-[status-breathe_2.4s_ease-out_infinite]";
    case "Looking":
      return "bg-sky-500 animate-[status-breathe_2s_ease-out_infinite]";
    case "In Call":
    case "In Chat":
      return "bg-stone-400";
    case "Busy":
      return "bg-amber-500";
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function avatarTone(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length;
  }
  return AVATAR_TONES[hash] ?? AVATAR_TONES[0];
}

export function OnlineList({
  users,
  mode,
  onConnect,
  disabled,
  connecting,
  myLevel,
  outgoingUserId,
  onCancelOutgoing,
}: OnlineListProps) {
  const isChat = mode === "chat";
  const sorted = [...users].sort((a, b) => {
    if (!myLevel) return 0;
    const aNear = isNearLevel(myLevel, a.level) ? 0 : 1;
    const bNear = isNearLevel(myLevel, b.level) ? 0 : 1;
    if (aNear !== bNear) return aNear - bNear;
    const statusRank = (s: PresenceStatus) =>
      s === "Looking" ? 0 : s === "Online" ? 1 : 2;
    return statusRank(a.status) - statusRank(b.status);
  });

  if (connecting) {
    return (
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[var(--page-surface)]/70 px-6 py-10 ring-1 ring-[var(--page-border)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,var(--accent-soft),transparent_55%)]" />
        <div className="relative flex items-center gap-3 text-sm text-stone-400">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          Joining the room…
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[1.75rem] bg-[var(--page-surface)]/70 px-6 py-10 ring-1 ring-[var(--page-border)]">
        <div className="pointer-events-none absolute -right-8 top-[-40%] h-40 w-40 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
              You’re first in this topic
            </p>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              {isChat
                ? "Stay here or invite a friend to join this room."
                : "Stay here and use Find a partner, or invite a friend to join this room."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex gap-3.5 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden">
      {sorted.map((user, index) => {
        const canConnect =
          user.status === "Online" || user.status === "Looking";
        const near = myLevel ? isNearLevel(myLevel, user.level) : false;
        const isOutgoingTarget = outgoingUserId === user.id;
        const connectingLabel = isChat ? "Connecting…" : "Calling…";

        return (
          <li
            key={user.id}
            className="shrink-0 animate-[soft-rise_0.55s_ease-out_both]"
            style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
          >
            <div
              className={`@container group relative flex h-[15.5rem] w-40 flex-col overflow-hidden rounded-[1.6rem] bg-[var(--page-surface)] p-4 pb-4 ring-1 transition duration-300 ${
                isOutgoingTarget
                  ? "ring-2 ring-teal-500/60 dark:ring-teal-400/50"
                  : "ring-[var(--page-border)] hover:-translate-y-1 hover:ring-teal-700/25 dark:hover:ring-teal-400/30"
              }`}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-teal-500/[0.08] to-transparent dark:from-teal-400/[0.1]" />

              <div
                className={`relative mx-auto mt-1 flex h-14 w-14 items-center justify-center rounded-full text-base font-semibold tracking-wide ${avatarTone(user.id)}`}
              >
                {initials(user.displayName) || "•"}
                <span
                  className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-[3px] ring-[var(--page-surface)] ${
                    isOutgoingTarget
                      ? "bg-amber-400 animate-pulse"
                      : statusDot(user.status)
                  }`}
                />
              </div>

              <div className="relative mt-3.5 min-w-0 flex-1 text-center">
                <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-50">
                  {user.displayName}
                </p>
                <p className="mt-1 truncate text-xs text-stone-400">
                  {user.learning} · {user.level}
                  {user.status === "Looking" ? " · looking" : ""}
                </p>
                {isOutgoingTarget ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {connectingLabel}
                  </span>
                ) : near ? (
                  <span className="mt-2 inline-flex max-w-full truncate rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-medium text-teal-800 dark:text-teal-300">
                    Near your level
                  </span>
                ) : null}
              </div>

              {isOutgoingTarget ? (
                <button
                  type="button"
                  onClick={onCancelOutgoing}
                  className="relative mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-stone-100 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-200 dark:bg-white/10 dark:text-stone-200 dark:hover:bg-white/15"
                >
                  <X className="h-3.5 w-3.5 shrink-0" />
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canConnect || disabled}
                  onClick={() => onConnect(user)}
                  aria-label={
                    isChat
                      ? `Chat with ${user.displayName}`
                      : `Call ${user.displayName}`
                  }
                  className="relative mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-stone-900 py-2 text-xs font-semibold text-white transition group-hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-teal-400 dark:text-stone-950 dark:group-hover:bg-teal-300"
                >
                  {isChat ? (
                    <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {isChat ? "Chat" : "Call"}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
