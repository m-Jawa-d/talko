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

/** Google STUN + Metered Open Relay TURN (when env credentials are set). */
export function getIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.relay.metered.ca:80" },
  ];

  const username = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const credential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

  if (username && credential) {
    const auth = { username, credential };
    servers.push(
      { urls: "turn:global.relay.metered.ca:80", ...auth },
      { urls: "turn:global.relay.metered.ca:80?transport=tcp", ...auth },
      { urls: "turn:global.relay.metered.ca:443", ...auth },
      { urls: "turns:global.relay.metered.ca:443?transport=tcp", ...auth }
    );
  } else if (typeof window !== "undefined") {
    console.warn(
      "[webrtc] NEXT_PUBLIC_TURN_USERNAME / NEXT_PUBLIC_TURN_CREDENTIAL missing — cross-network calls may fail"
    );
  }

  return servers;
}

export const LOBBY_CHANNEL = "talko-lobby";
export const PROFILE_STORAGE_KEY = "talko.profile.v1";
