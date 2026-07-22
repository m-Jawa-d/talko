import { languageSlug } from "@/lib/languages";
import { ConversationPrompt } from "@/lib/prompts";
import { RoomId } from "@/types";

export type { RoomId };

export interface PracticeRoom {
  id: RoomId;
  name: string;
  shortLabel: string;
  blurb: string;
  /** Prompt topic labels this room prefers; empty = all prompts */
  topics: string[];
}

export const PRACTICE_ROOMS: PracticeRoom[] = [
  {
    id: "open",
    name: "Open chat",
    shortLabel: "Open",
    blurb: "Talk about anything",
    topics: [],
  },
  {
    id: "daily",
    name: "Daily life",
    shortLabel: "Daily",
    blurb: "Routines, food, and habits",
    topics: ["Daily life", "Food"],
  },
  {
    id: "travel",
    name: "Travel",
    shortLabel: "Travel",
    blurb: "Places, trips, and stories",
    topics: ["Travel", "Stories"],
  },
  {
    id: "work",
    name: "Work & interview",
    shortLabel: "Work",
    blurb: "Jobs, study, and goals",
    topics: ["Work & study", "Future"],
  },
  {
    id: "opinions",
    name: "Opinions",
    shortLabel: "Opinions",
    blurb: "Debate and share your views",
    topics: ["Opinions", "Fun"],
  },
  {
    id: "hobbies",
    name: "Hobbies",
    shortLabel: "Hobbies",
    blurb: "Free time, sports, and passions",
    topics: ["Hobbies"],
  },
  {
    id: "culture",
    name: "Culture & media",
    shortLabel: "Culture",
    blurb: "Movies, music, books, and art",
    topics: ["Culture"],
  },
  {
    id: "tech",
    name: "Tech & internet",
    shortLabel: "Tech",
    blurb: "Apps, AI, and online life",
    topics: ["Tech"],
  },
];

export const DEFAULT_ROOM_ID: RoomId = "open";
export const ROOM_STORAGE_KEY = "talko.room.v1";

export function getRoom(id: RoomId): PracticeRoom {
  return PRACTICE_ROOMS.find((r) => r.id === id) ?? PRACTICE_ROOMS[0]!;
}

export function isRoomId(value: unknown): value is RoomId {
  return PRACTICE_ROOMS.some((r) => r.id === value);
}

/**
 * Lobby channels are scoped by learning language so Spanish practice
 * doesn’t mix with English (etc.). English open chat keeps the legacy
 * `talko-lobby` name so existing sessions still meet.
 */
export function roomChannelName(
  roomId: RoomId,
  learningLanguage = "English"
): string {
  const slug = languageSlug(learningLanguage) || "english";
  if (roomId === "open" && slug === "english") return "talko-lobby";
  if (roomId === "open") return `talko-lobby-${slug}`;
  return `talko-room-${slug}-${roomId}`;
}

export function loadRoomId(): RoomId {
  if (typeof window === "undefined") return DEFAULT_ROOM_ID;
  try {
    const raw = localStorage.getItem(ROOM_STORAGE_KEY);
    if (isRoomId(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_ROOM_ID;
}

export function saveRoomId(roomId: RoomId) {
  localStorage.setItem(ROOM_STORAGE_KEY, roomId);
}

export function promptsForRoom(
  prompts: ConversationPrompt[],
  roomId: RoomId
): ConversationPrompt[] {
  const room = getRoom(roomId);
  if (room.topics.length === 0) return prompts;
  const filtered = prompts.filter((p) => room.topics.includes(p.topic));
  return filtered.length > 0 ? filtered : prompts;
}
