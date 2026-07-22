"use client";

import { PRACTICE_ROOMS } from "@/lib/rooms";
import { RoomId } from "@/types";

interface RoomPickerProps {
  value: RoomId;
  onChange: (roomId: RoomId) => void;
  disabled?: boolean;
  preview?: boolean;
}

export function RoomPicker({
  value,
  onChange,
  disabled,
  preview = false,
}: RoomPickerProps) {
  return (
    <div
      role="tablist"
      aria-label="Practice topic"
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-stone-900/[0.04] p-1 ring-1 ring-[var(--page-border)] [-ms-overflow-style:none] [scrollbar-width:none] dark:bg-white/[0.04] [&::-webkit-scrollbar]:hidden"
    >
      {PRACTICE_ROOMS.map((room) => {
        const on = room.id === value;
        return (
          <button
            key={room.id}
            type="button"
            role="tab"
            aria-selected={on}
            disabled={disabled}
            tabIndex={preview ? -1 : undefined}
            onClick={() => {
              if (!preview) onChange(room.id);
            }}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
              on
                ? "bg-[var(--page-surface)] text-stone-900 shadow-sm ring-1 ring-stone-900/10 dark:bg-stone-100 dark:text-stone-900 dark:ring-0"
                : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
            }`}
          >
            {room.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
