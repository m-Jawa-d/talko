"use client";

import { FormEvent, useState } from "react";
import { LANGUAGE_LEVELS, LanguageLevel, UserProfile } from "@/types";

interface ProfileSetupProps {
  initial?: UserProfile | null;
  onSave: (input: { displayName: string; level: LanguageLevel }) => void;
  /** Read-only replica for the guide */
  preview?: boolean;
}

export function ProfileSetup({
  initial,
  onSave,
  preview = false,
}: ProfileSetupProps) {
  const [displayName, setDisplayName] = useState(
    initial?.displayName ?? (preview ? "Alex" : "")
  );
  const [level, setLevel] = useState<LanguageLevel>(initial?.level ?? "B1");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (preview || !displayName.trim()) return;
    onSave({ displayName: displayName.trim(), level });
  };

  return (
    <section className="mx-auto w-full max-w-md">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
        Create your profile
      </h1>
      <p className="mt-2 text-stone-500 dark:text-stone-400">
        Saved on this device. You&apos;ll practice English with other learners.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor={preview ? undefined : "name"}
            className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            Display name
          </label>
          <input
            id={preview ? undefined : "name"}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={28}
            placeholder="Your name"
            autoFocus={!preview}
            readOnly={preview}
            tabIndex={preview ? -1 : undefined}
            className="w-full border-b border-stone-300 bg-transparent py-2.5 text-lg text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-teal-600 dark:border-white/20 dark:text-stone-50 dark:placeholder:text-stone-600 dark:focus:border-teal-400"
          />
        </div>

        <div>
          <label
            htmlFor={preview ? undefined : "level"}
            className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            English level
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {LANGUAGE_LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  if (!preview) setLevel(lvl);
                }}
                tabIndex={preview ? -1 : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  level === lvl
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-white/10 dark:text-stone-300 dark:hover:bg-white/15"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          {!preview ? <input id="level" type="hidden" value={level} /> : null}
        </div>

        <button
          type="submit"
          disabled={!displayName.trim()}
          tabIndex={preview ? -1 : undefined}
          className="mt-4 w-full rounded-full bg-stone-900 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-stone-300 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-teal-200 dark:disabled:bg-stone-700 dark:disabled:text-stone-500"
        >
          Continue
        </button>
      </form>
    </section>
  );
}
