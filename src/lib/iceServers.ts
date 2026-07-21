/** Build ICE servers for WebRTC (STUN + Metered TURN). */

const GOOGLE_STUN: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

/** Metered static-credential hosts (from their Instructions panel). */
function meteredStaticServers(
  username: string,
  credential: string
): RTCIceServer[] {
  const auth = { username, credential };
  return [
    { urls: "stun:stun.relay.metered.ca:80" },
    { urls: "turn:global.relay.metered.ca:80", ...auth },
    { urls: "turn:global.relay.metered.ca:80?transport=tcp", ...auth },
    { urls: "turn:global.relay.metered.ca:443", ...auth },
    { urls: "turns:global.relay.metered.ca:443?transport=tcp", ...auth },
  ];
}

function parseIceServersJson(raw: string | undefined): RTCIceServer[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as RTCIceServer[];
  } catch {
    console.error("[webrtc] NEXT_PUBLIC_TURN_ICE_SERVERS is invalid JSON");
    return null;
  }
}

/**
 * Sync fallback used before / if async Metered fetch fails.
 * Prefer NEXT_PUBLIC_TURN_ICE_SERVERS (paste from Metered → Instructions).
 */
export function getIceServersSync(): RTCIceServer[] {
  const fromJson = parseIceServersJson(
    process.env.NEXT_PUBLIC_TURN_ICE_SERVERS
  );
  if (fromJson) return fromJson;

  const username = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const credential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;
  if (username && credential) {
    return [...GOOGLE_STUN, ...meteredStaticServers(username, credential)];
  }

  return [...GOOGLE_STUN];
}

/**
 * Preferred: fetch the exact iceServers array from Metered
 * (Dashboard → TURN credential → Show API Key).
 */
export async function fetchIceServers(): Promise<RTCIceServer[]> {
  const domain = process.env.NEXT_PUBLIC_METERED_DOMAIN?.replace(
    /^https?:\/\//,
    ""
  ).replace(/\/+$/, "");
  const apiKey = process.env.NEXT_PUBLIC_METERED_TURN_API_KEY;

  if (domain && apiKey) {
    try {
      const url = `https://${domain}/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error("[webrtc] Metered TURN API failed", res.status);
      } else {
        const data = (await res.json()) as RTCIceServer[];
        if (Array.isArray(data) && data.length > 0) {
          console.log("[webrtc] loaded iceServers from Metered API", {
            count: data.length,
          });
          return data;
        }
      }
    } catch (err) {
      console.error("[webrtc] Metered TURN API error", err);
    }
  }

  const sync = getIceServersSync();
  const hasTurn = sync.some((s) => String(s.urls).includes("turn:"));
  if (!hasTurn && typeof window !== "undefined") {
    console.warn(
      "[webrtc] No TURN configured — cross-network calls will usually fail"
    );
  }
  return sync;
}

export function iceServersHaveTurn(servers: RTCIceServer[]): boolean {
  return servers.some((s) => String(s.urls).includes("turn:"));
}

export function candidateType(candidate: string | undefined): string {
  if (!candidate) return "unknown";
  if (candidate.includes(" typ relay ")) return "relay";
  if (candidate.includes(" typ srflx ")) return "srflx";
  if (candidate.includes(" typ prflx ")) return "prflx";
  if (candidate.includes(" typ host ")) return "host";
  return "other";
}
