"use client";

import { Phone } from "lucide-react";
import { PresenceStatus, PresenceUser } from "@/types";

interface OnlineListProps {
  users: PresenceUser[];
  onCall: (user: PresenceUser) => void;
  disabled?: boolean;
  connecting?: boolean;
}

function statusDot(status: PresenceStatus) {
  switch (status) {
    case "Online":
      return "bg-teal-500 shadow-[0_0_0_3px_var(--accent-soft)]";
    case "Looking":
      return "bg-sky-500";
    case "In Call":
      return "bg-stone-400";
    case "Busy":
      return "bg-amber-500";
  }
}

export function OnlineList({
  users,
  onCall,
  disabled,
  connecting,
}: OnlineListProps) {
  return (
    <div>
      <div className="mb-8 flex items-baseline justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          Online
        </h2>
        <span className="text-sm tabular-nums text-stone-400">
          {connecting ? "…" : users.length}
        </span>
      </div>

      {connecting ? (
        <p className="text-sm text-stone-400">Joining lobby…</p>
      ) : users.length === 0 ? (
        <p className="max-w-xs text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          Nobody else is here yet. Open another tab or invite a partner.
        </p>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => {
            const canCall =
              user.status === "Online" || user.status === "Looking";
            return (
              <li key={user.id}>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-transparent bg-[var(--page-surface)] px-4 py-3.5 ring-1 ring-[var(--page-border)] transition hover:ring-stone-900/15 dark:hover:ring-white/20">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${statusDot(user.status)}`}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-900 dark:text-stone-50">
                        {user.displayName}
                      </p>
                      <p className="text-sm text-stone-400">{user.level}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canCall || disabled}
                    onClick={() => onCall(user)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-stone-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 dark:bg-teal-400 dark:text-stone-950 dark:hover:bg-teal-300 dark:disabled:bg-stone-700 dark:disabled:text-stone-500"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
