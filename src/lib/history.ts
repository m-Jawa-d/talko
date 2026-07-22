import { CallHistoryEntry, CallRatingTag, HISTORY_STORAGE_KEY } from "@/types";

const MAX_ENTRIES = 30;

export function loadHistory(): CallHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CallHistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) => e?.id && e?.peerName && typeof e.durationSeconds === "number"
    );
  } catch {
    return [];
  }
}

export function saveHistoryEntry(
  entry: Omit<CallHistoryEntry, "id" | "endedAt"> & {
    id?: string;
    endedAt?: string;
  }
): CallHistoryEntry[] {
  const next: CallHistoryEntry = {
    id: entry.id ?? crypto.randomUUID(),
    peerId: entry.peerId,
    peerName: entry.peerName,
    peerLevel: entry.peerLevel,
    durationSeconds: entry.durationSeconds,
    endedAt: entry.endedAt ?? new Date().toISOString(),
    ratings: entry.ratings ?? [],
    note: entry.note?.trim() || undefined,
    prompt: entry.prompt,
    roomId: entry.roomId,
  };

  const list = [next, ...loadHistory()].slice(0, MAX_ENTRIES);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
  return list;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}

export const RATING_OPTIONS: { id: CallRatingTag; label: string }[] = [
  { id: "helpful", label: "Helpful" },
  { id: "clear", label: "Clear speaker" },
  { id: "kind", label: "Kind" },
];
