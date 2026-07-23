import type { LearningLanguage } from "@/lib/languages";

export type { LearningLanguage };
export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type PresenceStatus =
  | "Online"
  | "Looking"
  | "Busy"
  | "In Call"
  | "In Chat";

export interface UserProfile {
  id: string;
  displayName: string;
  level: LanguageLevel;
  learning: LearningLanguage;
}

export interface PresenceUser extends UserProfile {
  status: PresenceStatus;
}

export type SessionKind = "call" | "chat";

export type SignalType =
  | "call-invite"
  | "call-accept"
  | "call-decline"
  | "call-end"
  | "webrtc-offer"
  | "webrtc-answer"
  | "webrtc-ice"
  | "chat-invite"
  | "chat-accept"
  | "chat-decline"
  | "chat-end"
  | "chat-message";

export interface SignalPayload {
  type: SignalType;
  from: PresenceUser;
  toId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  /** Text body for chat-message */
  text?: string;
  messageId?: string;
}

export interface ChatMessage {
  id: string;
  fromId: string;
  text: string;
  sentAt: number;
}

export const LANGUAGE_LEVELS: LanguageLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

export type CallRatingTag = "helpful" | "clear" | "kind";

export type RoomId =
  | "open"
  | "daily"
  | "travel"
  | "work"
  | "opinions"
  | "hobbies"
  | "culture"
  | "tech";

export interface CallHistoryEntry {
  id: string;
  peerId: string;
  peerName: string;
  peerLevel: LanguageLevel;
  durationSeconds: number;
  endedAt: string;
  ratings: CallRatingTag[];
  note?: string;
  prompt?: string;
  roomId?: RoomId;
}

/** Persisted Messenger-style conversation with one peer */
export interface ChatThread {
  peerId: string;
  peerName: string;
  peerLevel: LanguageLevel;
  peerLearning: LearningLanguage;
  messages: ChatMessage[];
  updatedAt: string;
}

export type PracticeMode = "call" | "chat";

export const PROFILE_STORAGE_KEY = "talko.profile.v1";
/** @deprecated use CALL_HISTORY_STORAGE_KEY */
export const HISTORY_STORAGE_KEY = "talko.history.v1";
export const CALL_HISTORY_STORAGE_KEY = "talko.callHistory.v1";
export const CHAT_THREADS_STORAGE_KEY = "talko.chatThreads.v1";
