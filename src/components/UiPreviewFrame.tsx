"use client";

/**
 * Centers and scales a live UI replica inside a clipped frame.
 * Guide previews stay in sync because they render real components.
 */
export function UiPreviewFrame({
  children,
  scale = 0.55,
  className = "",
}: {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-[var(--page-bg)] ring-1 ring-[var(--page-border)] ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
        <div
          className="pointer-events-none max-w-none select-none"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
