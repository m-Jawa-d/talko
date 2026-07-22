"use client";

import { getRoom } from "@/lib/rooms";
import { CallHistoryEntry } from "@/types";

interface CallHistoryProps {
  entries: CallHistoryEntry[];
  preview?: boolean;
}

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatDuration(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function CallHistory({ entries, preview = false }: CallHistoryProps) {
  const shown = entries.slice(0, 3);
  if (shown.length === 0 && !preview) return null;

  const list =
    shown.length > 0
      ? shown
      : ([
          {
            id: "demo",
            peerId: "x",
            peerName: "Sam",
            peerLevel: "B2",
            durationSeconds: 312,
            endedAt: new Date().toISOString(),
            ratings: ["helpful", "kind"],
            roomId: "travel",
          },
        ] as CallHistoryEntry[]);

  return (
    <details className="group mt-10 rounded-[1.5rem] bg-[var(--page-surface)]/50 ring-1 ring-[var(--page-border)] open:bg-[var(--page-surface)]/80">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm text-stone-500 transition hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 [&::-webkit-details-marker]:hidden">
        <span className="font-medium">Recent sessions</span>
        <span className="inline-flex items-center gap-2 text-stone-400">
          <span className="tabular-nums">
            {entries.length || (preview ? 1 : 0)}
          </span>
          <span className="transition group-open:rotate-90">›</span>
        </span>
      </summary>
      <ul className="space-y-1 border-t border-[var(--page-border)] px-3 py-3">
        {list.map((entry) => {
          const roomLabel = entry.roomId ? getRoom(entry.roomId).name : null;
          return (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-stone-700 dark:text-stone-200">
                  {entry.peerName}
                  <span className="ml-1.5 font-normal text-stone-400">
                    {entry.peerLevel}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-xs text-stone-400">
                  {roomLabel ? `${roomLabel} · ` : ""}
                  {formatWhen(entry.endedAt)}
                  {entry.ratings.length > 0
                    ? ` · ${entry.ratings.join(", ")}`
                    : ""}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums text-stone-400">
                {formatDuration(entry.durationSeconds)}
              </span>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
