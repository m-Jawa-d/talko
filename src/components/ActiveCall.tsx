"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  RefreshCw,
  Send,
  WifiOff,
  X,
} from "lucide-react";
import { AudioWaveform } from "@/components/AudioWaveform";
import type { CallFailureReason } from "@/hooks/useWebRTC";
import {
  CONVERSATION_PROMPTS,
  ConversationPrompt,
  pickRandomPrompt,
} from "@/lib/prompts";
import { getRoom, promptsForRoom } from "@/lib/rooms";
import { ChatMessage, RoomId } from "@/types";

interface ActiveCallProps {
  peerName: string;
  peerLevel?: string;
  peerLearning?: string;
  myId?: string;
  roomId?: RoomId;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  failureReason?: CallFailureReason | null;
  isMuted: boolean;
  messages?: ChatMessage[];
  onSendMessage?: (text: string) => void;
  onToggleMute: () => void;
  onEndCall: () => void;
  onPromptChange?: (prompt: ConversationPrompt) => void;
  preview?: boolean;
  previewSeconds?: number;
  previewPrompt?: ConversationPrompt;
}

function formatTime(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function failureCopy(reason: CallFailureReason | null | undefined) {
  switch (reason) {
    case "mic-denied":
      return {
        title: "Microphone blocked",
        body: "Allow microphone access in your browser settings, then try calling again.",
      };
    case "mic-error":
      return {
        title: "Microphone unavailable",
        body: "We couldn’t access your mic. Check that another app isn’t using it, then try again.",
      };
    case "timeout":
      return {
        title: "Couldn’t connect",
        body: "The call didn’t connect in time. This often happens across different networks. Try again later.",
      };
    case "disconnected":
      return {
        title: "Call dropped",
        body: "The connection was lost. Check your internet and try calling again.",
      };
    case "failed":
    default:
      return {
        title: "Couldn’t connect",
        body: "Audio couldn’t be established between you and your partner. Try again on the same Wi‑Fi, or later from another network.",
      };
  }
}

export function ActiveCall({
  peerName,
  peerLevel,
  peerLearning,
  myId = "",
  roomId = "open",
  localStream,
  remoteStream,
  connectionState,
  failureReason = null,
  isMuted,
  messages = [],
  onSendMessage,
  onToggleMute,
  onEndCall,
  onPromptChange,
  preview = false,
  previewSeconds = 95,
  previewPrompt,
}: ActiveCallProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const [seconds, setSeconds] = useState(preview ? previewSeconds : 0);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const promptPool = useMemo(
    () => promptsForRoom(CONVERSATION_PROMPTS, roomId),
    [roomId]
  );
  const room = getRoom(roomId);
  const [prompt, setPrompt] = useState<ConversationPrompt>(() =>
    previewPrompt ?? pickRandomPrompt(null, promptPool)
  );
  const peerInitials = useMemo(() => initials(peerName) || "•", [peerName]);
  const onPromptChangeRef = useRef(onPromptChange);
  onPromptChangeRef.current = onPromptChange;

  useEffect(() => {
    if (preview) return;
    onPromptChangeRef.current?.(prompt);
  }, [prompt, preview]);

  useEffect(() => {
    if (preview) return;
    const el = audioRef.current;
    if (!el || !remoteStream) return;
    el.srcObject = remoteStream;
    void el.play().catch(() => undefined);
  }, [remoteStream, preview]);

  useEffect(() => {
    if (preview) return;
    const id = window.setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [preview]);

  useEffect(() => {
    if (!chatOpen) return;
    const el = chatListRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, chatOpen]);

  const nextPrompt = () => {
    if (preview) return;
    setPrompt((current) => pickRandomPrompt(current.id, promptPool));
  };

  const sendChat = (e?: FormEvent) => {
    e?.preventDefault();
    if (preview || !onSendMessage) return;
    const text = draft.trim();
    if (!text) return;
    onSendMessage(text);
    setDraft("");
  };

  const connected = connectionState === "connected";
  const failed = Boolean(failureReason) || connectionState === "failed";
  const statusLabel = failed
    ? "Failed"
    : connected
      ? "Connected"
      : "Connecting";

  const copy = failureCopy(failureReason);
  const unreadHint =
    !chatOpen && messages.some((m) => m.fromId !== myId);

  return (
    <div
      className={
        preview
          ? "relative h-full min-h-0 overflow-hidden bg-[var(--page-bg)]"
          : "fixed inset-0 z-50 overflow-hidden bg-[var(--page-bg)]"
      }
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-10%] h-[55vh] w-[55vh] rounded-full bg-teal-400/20 blur-3xl animate-[call-orb_12s_ease-in-out_infinite_alternate] dark:bg-teal-400/15" />
        <div className="absolute -right-16 bottom-[-5%] h-[50vh] w-[50vh] rounded-full bg-sky-400/15 blur-3xl animate-[call-orb_14s_ease-in-out_infinite_alternate-reverse] dark:bg-sky-400/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--page-bg)_78%)]" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <header className="flex items-center justify-between px-6 pt-6 sm:px-10">
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Talko
          </p>
          <div className="flex items-center gap-2 rounded-full bg-[var(--page-surface)]/80 px-3 py-1.5 text-xs ring-1 ring-[var(--page-border)] backdrop-blur-md">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                failed
                  ? "bg-rose-500"
                  : connected
                    ? "bg-teal-500 animate-pulse"
                    : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="font-mono tabular-nums text-stone-700 dark:text-stone-200">
              {formatTime(seconds)}
            </span>
            <span className="text-stone-300 dark:text-stone-600">·</span>
            <span
              className={
                failed
                  ? "text-rose-600 dark:text-rose-300"
                  : connected
                    ? "text-teal-700 dark:text-teal-300"
                    : "text-amber-700 dark:text-amber-300"
              }
            >
              {statusLabel}
            </span>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
          {failed && !preview ? (
            <div className="w-full max-w-md rounded-[2rem] bg-[var(--page-surface)] p-8 text-center ring-1 ring-[var(--page-border)]">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300">
                <WifiOff className="h-6 w-6" />
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 dark:text-stone-50">
                {copy.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                {copy.body}
              </p>
              <button
                type="button"
                onClick={onEndCall}
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-stone-900 px-6 text-sm font-semibold text-white transition hover:bg-teal-800 dark:bg-teal-400 dark:text-stone-950 dark:hover:bg-teal-300"
              >
                Back to practice
              </button>
            </div>
          ) : (
            <>
              <div className="relative mb-8">
                <div
                  className={`absolute inset-0 rounded-full bg-teal-400/25 blur-2xl transition ${
                    connected ? "scale-110 opacity-100" : "scale-95 opacity-50"
                  }`}
                />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[var(--page-surface)] text-3xl font-semibold tracking-tight text-stone-800 ring-1 ring-[var(--page-border)] dark:text-stone-100 sm:h-32 sm:w-32 sm:text-4xl">
                  {peerInitials}
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">
                {room.name}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
                {peerName}
              </h2>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                {peerLearning ?? "Language"}
                {peerLevel ? ` · ${peerLevel}` : ""}
              </p>

              <div className="mt-12 grid w-full max-w-lg grid-cols-2 gap-6 rounded-[2rem] bg-[var(--page-surface)]/70 p-8 ring-1 ring-[var(--page-border)] backdrop-blur-md sm:gap-10 sm:p-10">
                <AudioWaveform
                  stream={localStream}
                  label={isMuted ? "You · muted" : "You"}
                  tone={isMuted ? "muted" : "self"}
                  size="lg"
                />
                <AudioWaveform
                  stream={remoteStream}
                  label={peerName}
                  tone="peer"
                  size="lg"
                />
              </div>

              <div className="mt-6 w-full max-w-lg rounded-[1.5rem] bg-[var(--page-surface)]/80 px-5 py-4 ring-1 ring-[var(--page-border)] backdrop-blur-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
                      Talk about · {prompt.topic}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-700 dark:text-stone-200">
                      {prompt.text}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={nextPrompt}
                    tabIndex={preview ? -1 : undefined}
                    aria-label="Next prompt"
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 ring-1 ring-[var(--page-border)] transition hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {!preview ? <audio ref={audioRef} autoPlay playsInline /> : null}
            </>
          )}
        </main>

        {!failed || preview ? (
          <footer className="flex items-center justify-center gap-4 px-6 pb-10 pt-2">
            <button
              type="button"
              onClick={onToggleMute}
              tabIndex={preview ? -1 : undefined}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className={`flex h-14 w-14 items-center justify-center rounded-full ring-1 transition ${
                isMuted
                  ? "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-400/20 dark:text-amber-200 dark:ring-amber-400/30"
                  : "bg-[var(--page-surface)] text-stone-700 ring-[var(--page-border)] hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/10"
              }`}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
            {onSendMessage || preview ? (
              <button
                type="button"
                onClick={() => {
                  if (!preview) setChatOpen((open) => !open);
                }}
                tabIndex={preview ? -1 : undefined}
                aria-label={chatOpen ? "Close chat" : "Open chat"}
                className={`relative flex h-14 w-14 items-center justify-center rounded-full ring-1 transition ${
                  chatOpen
                    ? "bg-teal-700 text-white ring-teal-700 dark:bg-teal-400 dark:text-stone-950 dark:ring-teal-400"
                    : "bg-[var(--page-surface)] text-stone-700 ring-[var(--page-border)] hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/10"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                {unreadHint ? (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-teal-400 ring-2 ring-[var(--page-bg)]" />
                ) : null}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onEndCall}
              tabIndex={preview ? -1 : undefined}
              className="inline-flex h-14 items-center gap-2 rounded-full bg-rose-600 px-8 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(225,29,72,0.7)] transition hover:bg-rose-500"
            >
              <PhoneOff className="h-5 w-5" />
              End call
            </button>
          </footer>
        ) : null}
      </div>

      {chatOpen && !preview && onSendMessage ? (
        <div className="absolute inset-x-0 bottom-0 z-20 flex max-h-[55%] flex-col rounded-t-[1.75rem] bg-[var(--page-surface)] shadow-[0_-12px_40px_-20px_rgba(0,0,0,0.35)] ring-1 ring-[var(--page-border)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-h-[70%] sm:w-[22rem] sm:rounded-[1.5rem]">
          <div className="flex items-center justify-between border-b border-[var(--page-border)] px-4 py-3">
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
              Chat with {peerName}
            </p>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div
            ref={chatListRef}
            className="min-h-0 flex-1 overflow-y-auto px-4 py-3"
          >
            {messages.length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-400">
                Type while you talk — helpful for spelling or links.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {messages.map((msg) => {
                  const mine = msg.fromId === myId;
                  return (
                    <li
                      key={msg.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
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
          <form
            onSubmit={sendChat}
            className="flex items-end gap-2 border-t border-[var(--page-border)] px-3 py-3"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendChat();
                }
              }}
              rows={1}
              maxLength={500}
              placeholder="Message…"
              className="max-h-24 min-h-[2.5rem] flex-1 resize-none rounded-xl bg-[var(--page-bg)] px-3 py-2 text-sm text-stone-900 outline-none ring-1 ring-[var(--page-border)] placeholder:text-stone-400 focus:ring-teal-600/40 dark:text-stone-50"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition hover:bg-teal-800 disabled:opacity-35 dark:bg-teal-400 dark:text-stone-950"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
