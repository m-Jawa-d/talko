import {
  DEFAULT_LEARNING_LANGUAGE,
  isLearningLanguage,
} from "@/lib/languages";
import { PROFILE_STORAGE_KEY, UserProfile } from "@/types";

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    if (!parsed?.id || !parsed?.displayName || !parsed?.level) return null;
    return {
      id: parsed.id,
      displayName: parsed.displayName,
      level: parsed.level,
      learning: isLearningLanguage(parsed.learning)
        ? parsed.learning
        : DEFAULT_LEARNING_LANGUAGE,
    };
  } catch {
    return null;
  }
}

export function saveProfile(
  input: Omit<UserProfile, "id"> & { id?: string }
): UserProfile {
  const existing = loadProfile();
  const profile: UserProfile = {
    id: input.id ?? existing?.id ?? crypto.randomUUID(),
    displayName: input.displayName.trim(),
    level: input.level,
    learning: isLearningLanguage(input.learning)
      ? input.learning
      : DEFAULT_LEARNING_LANGUAGE,
  };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  return profile;
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}
