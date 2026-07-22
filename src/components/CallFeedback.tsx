"use client";

import { FormEvent, useState } from "react";
import { RATING_OPTIONS } from "@/lib/history";
import { CallRatingTag, LanguageLevel } from "@/types";

interface CallFeedbackProps {
  peerName: string;
  peerLevel: LanguageLevel;
  peerLearning: string;
  durationSeconds: number;
  onSubmit: (input: { ratings: CallRatingTag[]; note: string }) => void;
  onSkip: () => void;
}

function formatDuration(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function CallFeedback({
  peerName,
  peerLevel,
  peerLearning,
  durationSeconds,
  onSubmit,
  onSkip,
}: CallFeedbackProps) {
  const [ratings, setRatings] = useState<CallRatingTag[]>([]);
  const [note, setNote] = useState("");

  const toggle = (tag: CallRatingTag) => {
    setRatings((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ ratings, note: note.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/40 px-4 pb-6 pt-16 backdrop-blur-sm sm:items-center sm:pb-0 dark:bg-black/55">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[2rem] bg-[var(--page-surface)] p-7 ring-1 ring-[var(--page-border)] sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
          Session ended · {formatDuration(durationSeconds)}
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          How was practice with {peerName}?
        </h2>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {peerLearning} · {peerLevel}. Optional — helps you remember good
          partners.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {RATING_OPTIONS.map(({ id, label }) => {
            const on = ratings.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  on
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-white/10 dark:text-stone-300 dark:hover:bg-white/15"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
            Note <span className="font-normal text-stone-400">(optional)</span>
          </span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
            placeholder="Great for travel topics…"
            className="w-full border-b border-stone-300 bg-transparent py-2 text-sm text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-teal-600 dark:border-white/20 dark:text-stone-50 dark:placeholder:text-stone-600 dark:focus:border-teal-400"
          />
        </label>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex h-11 items-center rounded-full bg-stone-900 px-6 text-sm font-semibold text-white transition hover:bg-teal-800 dark:bg-teal-400 dark:text-stone-950 dark:hover:bg-teal-300"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-stone-500 underline-offset-4 transition hover:text-stone-800 hover:underline dark:text-stone-400 dark:hover:text-stone-200"
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}
