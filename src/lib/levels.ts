import { LANGUAGE_LEVELS, LanguageLevel, PresenceUser } from "@/types";

export function levelIndex(level: LanguageLevel): number {
  return LANGUAGE_LEVELS.indexOf(level);
}

/** Absolute CEFR distance (A1↔A2 = 1, A1↔B1 = 2, …). */
export function levelDistance(a: LanguageLevel, b: LanguageLevel): number {
  return Math.abs(levelIndex(a) - levelIndex(b));
}

/** Prefer Looking, then nearby CEFR (±1), with a little randomness. */
export function pickPartner(
  candidates: PresenceUser[],
  myLevel: LanguageLevel,
  myId: string
): PresenceUser | null {
  if (candidates.length === 0) return null;

  const looking = candidates.filter((u) => u.status === "Looking");
  const pool = looking.length > 0 ? looking : candidates;

  const scored = pool.map((user) => {
    const dist = levelDistance(myLevel, user.level);
    const nearBonus = dist <= 1 ? 0 : dist <= 2 ? 2 : 5;
    const lookingBonus = user.status === "Looking" ? 0 : 1;
    const jitter = Math.random() * 0.4;
    return { user, score: nearBonus + lookingBonus + jitter, dist };
  });

  scored.sort((a, b) => a.score - b.score);
  const partner = scored[0]?.user;
  if (!partner) return null;

  // Deterministic pairing when both are Looking: lower id invites
  if (partner.status === "Looking" && partner.id < myId) {
    return null;
  }

  return partner;
}

export function isNearLevel(
  myLevel: LanguageLevel,
  theirLevel: LanguageLevel,
  maxDistance = 1
): boolean {
  return levelDistance(myLevel, theirLevel) <= maxDistance;
}
