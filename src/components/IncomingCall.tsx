"use client";

import { Phone, PhoneOff } from "lucide-react";
import { PresenceUser } from "@/types";

interface IncomingCallProps {
  caller: PresenceUser;
  onAccept: () => void;
  onDecline: () => void;
  /** Embedded replica for the guide (not a fullscreen overlay) */
  preview?: boolean;
}

export function IncomingCall({
  caller,
  onAccept,
  onDecline,
  preview = false,
}: IncomingCallProps) {
  return (
    <div
      className={
        preview
          ? "relative flex items-center justify-center rounded-3xl bg-stone-950/45 p-6 backdrop-blur-[2px]"
          : "fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-4 backdrop-blur-[2px] sm:items-center"
      }
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-xl dark:bg-stone-900 dark:ring-1 dark:ring-white/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
          Incoming call
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 dark:text-stone-50">
          {caller.displayName}
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          English · {caller.level}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onDecline}
            tabIndex={preview ? -1 : undefined}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-100 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200 dark:bg-white/10 dark:text-stone-200 dark:hover:bg-white/15"
          >
            <PhoneOff className="h-4 w-4" />
            Decline
          </button>
          <button
            type="button"
            onClick={onAccept}
            tabIndex={preview ? -1 : undefined}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
          >
            <Phone className="h-4 w-4" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
