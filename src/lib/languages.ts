/** Languages learners can practice on Talko. */
export const LEARNING_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
  "Korean",
  "Chinese",
  "Arabic",
  "Hindi",
  "Russian",
  "Dutch",
  "Swedish",
  "Polish",
  "Turkish",
  "Vietnamese",
  "Indonesian",
  "Thai",
  "Greek",
] as const;

export type LearningLanguage = (typeof LEARNING_LANGUAGES)[number];

export const DEFAULT_LEARNING_LANGUAGE: LearningLanguage = "English";

export function isLearningLanguage(value: unknown): value is LearningLanguage {
  return (
    typeof value === "string" &&
    (LEARNING_LANGUAGES as readonly string[]).includes(value)
  );
}

/** Stable slug for Realtime channel names. */
export function languageSlug(language: string): string {
  return language
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
