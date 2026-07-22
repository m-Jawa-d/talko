"use client";

import { Loader2, MessageCircle, Phone, X } from "lucide-react";
import { PresenceUser, SessionKind } from "@/types";

interface OutgoingInviteProps {
  peer: PresenceUser;
  kind: SessionKind;
  onCancel: () => void;
  /** Embedded replica for the guide (not a fullscreen overlay) */
  preview?: boolean;
}

export function OutgoingInvite({
  peer,
  kind,
  onCancel,
  preview = false,
}: OutgoingInviteProps) {
  const isChat = kind === "chat";

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
          {isChat ? "Starting chat" : "Calling"}
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 dark:text-stone-50">
          {peer.displayName}
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {peer.learning} · {peer.level}
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300">
            {isChat ? (
              <MessageCircle className="h-7 w-7 animate-pulse" />
            ) : (
              <Phone className="h-7 w-7 animate-pulse" />
            )}
          </div>
          <p className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Waiting for {peer.displayName} to accept…
          </p>
          <button
            type="button"
            onClick={onCancel}
            tabIndex={preview ? -1 : undefined}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-100 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-200 dark:bg-white/10 dark:text-stone-200 dark:hover:bg-white/15"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
