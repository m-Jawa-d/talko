export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type PresenceStatus = "Online" | "Looking" | "Busy" | "In Call";

export interface UserProfile {
  id: string;
  displayName: string;
  level: LanguageLevel;
  learning: "English";
}

export interface PresenceUser extends UserProfile {
  status: PresenceStatus;
}

export type SignalType =
  | "call-invite"
  | "call-accept"
  | "call-decline"
  | "call-end"
  | "webrtc-offer"
  | "webrtc-answer"
  | "webrtc-ice";

export interface SignalPayload {
  type: SignalType;
  from: PresenceUser;
  toId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
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

export const PROFILE_STORAGE_KEY = "talko.profile.v1";
export const HISTORY_STORAGE_KEY = "talko.history.v1";
