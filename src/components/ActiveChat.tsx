"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import {
  CONVERSATION_PROMPTS,
  ConversationPrompt,
  pickRandomPrompt,
} from "@/lib/prompts";
import { getRoom, promptsForRoom } from "@/lib/rooms";
import { ChatMessage, RoomId } from "@/types";

interface ActiveChatProps {
  peerName: string;
  peerLevel?: string;
  peerLearning?: string;
  myId: string;
  roomId?: RoomId;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onEndChat: () => void;
  onPromptChange?: (prompt: ConversationPrompt) => void;
  preview?: boolean;
  previewMessages?: ChatMessage[];
}

export function ActiveChat({
  peerName,
  peerLevel,
  peerLearning,
  myId,
  roomId = "open",
  messages,
  onSend,
  onEndChat,
  onPromptChange,
  preview = false,
  previewMessages,
}: ActiveChatProps) {
  const [draft, setDraft] = useState("");
  const [seconds, setSeconds] = useState(preview ? 72 : 0);
  const listRef = useRef<HTMLDivElement>(null);
  const promptPool = promptsForRoom(CONVERSATION_PROMPTS, roomId);
  const room = getRoom(roomId);
  const [prompt, setPrompt] = useState<ConversationPrompt>(() =>
    pickRandomPrompt(null, promptPool)
  );
  const onPromptChangeRef = useRef(onPromptChange);
  onPromptChangeRef.current = onPromptChange;

  const visible = preview && previewMessages ? previewMessages : messages;

  useEffect(() => {
    if (preview) return;
    onPromptChangeRef.current?.(prompt);
  }, [prompt, preview]);

  useEffect(() => {
    if (preview) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [preview]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [visible.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (preview) return;
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");

  return (
    <div
      className={
        preview
          ? "relative flex h-full flex-col bg-[var(--page-bg)]"
          : "fixed inset-0 z-40 flex flex-col bg-[var(--page-bg)]"
      }
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[-10%] h-[45vh] w-[45vh] rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-400/10" />
        <div className="absolute -right-20 bottom-[-8%] h-[40vh] w-[40vh] rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-400/8" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-5 pt-6 sm:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
            Text · {room.name}
          </p>
          <h2 className="mt-1 truncate font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            {peerName}
          </h2>
          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            {peerLearning ?? "Language"}
            {peerLevel ? ` · ${peerLevel}` : ""}
            <span className="mx-1.5 text-stone-300 dark:text-stone-600">·</span>
            <span className="tabular-nums">
              {m}:{s}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onEndChat}
          tabIndex={preview ? -1 : undefined}
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-rose-200"
        >
          <X className="h-4 w-4" />
          End
        </button>
      </header>

      <div className="relative z-10 mx-auto mt-5 w-full max-w-2xl px-5 sm:px-8">
        <div className="flex items-start justify-between gap-3 rounded-2xl bg-[var(--page-surface)]/80 px-4 py-3 ring-1 ring-[var(--page-border)] backdrop-blur-md">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              Prompt
            </p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700 dark:text-stone-200">
              {prompt.text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPrompt(pickRandomPrompt(prompt.id, promptPool))}
            tabIndex={preview ? -1 : undefined}
            className="shrink-0 text-xs font-medium text-teal-700 transition hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100"
          >
            New
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        className="relative z-10 mx-auto mt-4 w-full max-w-2xl flex-1 overflow-y-auto px-5 pb-4 sm:px-8"
      >
        {visible.length === 0 ? (
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300">
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              Say hello, or start from the prompt above. This thread stays on
              your device so you can reopen it later.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3 py-2">
            {visible.map((msg) => {
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
                        : "rounded-bl-md bg-[var(--page-surface)] text-stone-800 ring-1 ring-[var(--page-border)] dark:text-stone-100"
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

      <form
        onSubmit={handleSubmit}
        className="relative z-10 mx-auto w-full max-w-2xl border-t border-[var(--page-border)] bg-[var(--page-bg)]/90 px-5 py-4 backdrop-blur-md sm:px-8"
      >
        <div className="flex items-end gap-2">
          <label className="sr-only" htmlFor={preview ? undefined : "chat-draft"}>
            Message
          </label>
          <textarea
            id={preview ? undefined : "chat-draft"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!preview && draft.trim()) {
                  onSend(draft.trim());
                  setDraft("");
                }
              }
            }}
            rows={1}
            maxLength={500}
            placeholder="Type a message…"
            readOnly={preview}
            tabIndex={preview ? -1 : undefined}
            className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-2xl border-0 bg-[var(--page-surface)] px-4 py-3 text-sm text-stone-900 outline-none ring-1 ring-[var(--page-border)] placeholder:text-stone-400 focus:ring-teal-600/40 dark:text-stone-50 dark:focus:ring-teal-400/40"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            tabIndex={preview ? -1 : undefined}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-teal-400 dark:text-stone-950 dark:hover:bg-teal-300"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
