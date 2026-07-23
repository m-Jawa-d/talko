"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { ChatThread, PresenceUser } from "@/types";

interface ChatInboxProps {
  threads: ChatThread[];
  myId: string;
  onlineUsers: PresenceUser[];
  onMessageAgain: (thread: ChatThread) => void;
  preview?: boolean;
}

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate()
    ) {
      return "Yesterday";
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
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

function lastPreview(thread: ChatThread, myId: string) {
  const last = thread.messages[thread.messages.length - 1];
  if (!last) return "No messages yet";
  const prefix = last.fromId === myId ? "You: " : "";
  return `${prefix}${last.text}`;
}

export function ChatInbox({
  threads,
  myId,
  onlineUsers,
  onMessageAgain,
  preview = false,
}: ChatInboxProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = threads.find((t) => t.peerId === openId) ?? null;
  const openOnline = open
    ? onlineUsers.some(
        (u) =>
          u.id === open.peerId &&
          (u.status === "Online" || u.status === "Looking")
      )
    : false;

  const shown =
    threads.length > 0
      ? threads
      : preview
        ? ([
            {
              peerId: "demo",
              peerName: "Sam",
              peerLevel: "B2",
              peerLearning: "Spanish",
              updatedAt: new Date().toISOString(),
              messages: [
                {
                  id: "1",
                  fromId: "demo",
                  text: "¡Hola! How was your weekend?",
                  sentAt: Date.now() - 3600000,
                },
                {
                  id: "2",
                  fromId: myId || "me",
                  text: "Pretty good — I tried a new café.",
                  sentAt: Date.now() - 3500000,
                },
              ],
            },
          ] as ChatThread[])
        : [];

  if (shown.length === 0) return null;

  return (
    <>
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              Messages
            </h2>
            <p className="mt-1 text-sm text-stone-400">
              Past sessions on this device · start a live chat to message
            </p>
          </div>
          <span className="text-xs tabular-nums text-stone-400">
            {threads.length || (preview ? 1 : 0)}
          </span>
        </div>

        <ul className="overflow-hidden rounded-[1.5rem] bg-[var(--page-surface)]/80 ring-1 ring-[var(--page-border)]">
          {shown.map((thread, index) => {
            const online = onlineUsers.some(
              (u) =>
                u.id === thread.peerId &&
                (u.status === "Online" || u.status === "Looking")
            );
            return (
              <li key={thread.peerId}>
                <button
                  type="button"
                  onClick={() => {
                    if (!preview) setOpenId(thread.peerId);
                  }}
                  tabIndex={preview ? -1 : undefined}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-stone-100/80 dark:hover:bg-white/5 ${
                    index > 0 ? "border-t border-[var(--page-border)]" : ""
                  }`}
                >
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-sm font-semibold text-teal-800 dark:text-teal-200">
                    {initials(thread.peerName) || "•"}
                    {online ? (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-teal-500 ring-2 ring-[var(--page-surface)]" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-50">
                        {thread.peerName}
                      </p>
                      <span className="shrink-0 text-[11px] text-stone-400">
                        {formatWhen(thread.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-stone-500 dark:text-stone-400">
                      {lastPreview(thread, myId)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {open && !preview ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-4 backdrop-blur-[2px] sm:items-center">
          <div className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-stone-900 dark:ring-1 dark:ring-white/10">
            <header className="flex items-center justify-between gap-3 border-b border-[var(--page-border)] px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900 dark:text-stone-50">
                  {open.peerName}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {open.peerLearning} · {open.peerLevel}
                  {openOnline ? " · online" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {open.messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-stone-400">
                  No messages in this thread yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {open.messages.map((msg) => {
                    const mine = msg.fromId === myId;
                    return (
                      <li
                        key={msg.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                            mine
                              ? "rounded-br-md bg-stone-900 text-white dark:bg-teal-400 dark:text-stone-950"
                              : "rounded-bl-md bg-stone-100 text-stone-800 dark:bg-white/10 dark:text-stone-100"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <footer className="border-t border-[var(--page-border)] px-4 py-4">
              {openOnline ? (
                <button
                  type="button"
                  onClick={() => {
                    onMessageAgain(open);
                    setOpenId(null);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 dark:bg-teal-400 dark:text-stone-950 dark:hover:bg-teal-300"
                >
                  <MessageCircle className="h-4 w-4" />
                  Start a new chat
                </button>
              ) : (
                <p className="text-center text-sm text-stone-500 dark:text-stone-400">
                  {open.peerName} isn’t online. You can read this past session —
                  messaging needs a live chat.
                </p>
              )}
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
