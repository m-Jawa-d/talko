import {
  CHAT_THREADS_STORAGE_KEY,
  ChatMessage,
  ChatThread,
  LanguageLevel,
  LearningLanguage,
} from "@/types";

const MAX_THREADS = 40;
const MAX_MESSAGES_PER_THREAD = 200;

function readThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_THREADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatThread[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) => t?.peerId && t?.peerName && Array.isArray(t.messages)
    );
  } catch {
    return [];
  }
}

function writeThreads(threads: ChatThread[]): ChatThread[] {
  localStorage.setItem(CHAT_THREADS_STORAGE_KEY, JSON.stringify(threads));
  return threads;
}

export function loadChatThreads(): ChatThread[] {
  return readThreads().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getChatThread(peerId: string): ChatThread | null {
  return readThreads().find((t) => t.peerId === peerId) ?? null;
}

export function upsertChatMessages(input: {
  peerId: string;
  peerName: string;
  peerLevel: LanguageLevel;
  peerLearning: LearningLanguage;
  messages: ChatMessage[];
}): ChatThread[] {
  const threads = readThreads();
  const existing = threads.find((t) => t.peerId === input.peerId);
  const mergedMap = new Map<string, ChatMessage>();

  for (const m of existing?.messages ?? []) mergedMap.set(m.id, m);
  for (const m of input.messages) mergedMap.set(m.id, m);

  const messages = Array.from(mergedMap.values())
    .sort((a, b) => a.sentAt - b.sentAt)
    .slice(-MAX_MESSAGES_PER_THREAD);

  const thread: ChatThread = {
    peerId: input.peerId,
    peerName: input.peerName,
    peerLevel: input.peerLevel,
    peerLearning: input.peerLearning,
    messages,
    updatedAt: new Date().toISOString(),
  };

  const next = [
    thread,
    ...threads.filter((t) => t.peerId !== input.peerId),
  ].slice(0, MAX_THREADS);

  return writeThreads(next);
}

export function appendChatMessage(input: {
  peerId: string;
  peerName: string;
  peerLevel: LanguageLevel;
  peerLearning: LearningLanguage;
  message: ChatMessage;
}): ChatThread[] {
  const existing = getChatThread(input.peerId);
  return upsertChatMessages({
    peerId: input.peerId,
    peerName: input.peerName,
    peerLevel: input.peerLevel,
    peerLearning: input.peerLearning,
    messages: [...(existing?.messages ?? []), input.message],
  });
}

export function clearChatThreads() {
  localStorage.removeItem(CHAT_THREADS_STORAGE_KEY);
}
