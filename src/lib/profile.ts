import { PROFILE_STORAGE_KEY, UserProfile } from "@/types";

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed?.id || !parsed?.displayName || !parsed?.level) return null;
    return { ...parsed, learning: "English" };
  } catch {
    return null;
  }
}

export function saveProfile(
  input: Omit<UserProfile, "id" | "learning"> & { id?: string }
): UserProfile {
  const existing = loadProfile();
  const profile: UserProfile = {
    id: input.id ?? existing?.id ?? crypto.randomUUID(),
    displayName: input.displayName.trim(),
    level: input.level,
    learning: "English",
  };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}
