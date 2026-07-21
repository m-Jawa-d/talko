"use client";

import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  stream: MediaStream | null;
  label: string;
  tone?: "self" | "peer" | "muted";
  size?: "md" | "lg";
}

export function AudioWaveform({
  stream,
  label,
  tone = "self",
  size = "md",
}: AudioWaveformProps) {
  const barCount = size === "lg" ? 9 : 5;
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) {
      barsRef.current.forEach((el) => {
        if (el) el.style.transform = "scaleY(0.18)";
      });
      return;
    }

    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const step = Math.max(1, Math.floor(data.length / barCount));
      for (let i = 0; i < barCount; i++) {
        const value = data[i * step] ?? 0;
        const scale = Math.max(0.16, Math.min(1, value / 150));
        const el = barsRef.current[i];
        if (el) el.style.transform = `scaleY(${scale})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    void ctx.resume();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      source.disconnect();
      void ctx.close();
    };
  }, [stream, barCount]);

  const barClass =
    tone === "muted"
      ? "bg-stone-300 dark:bg-stone-600"
      : tone === "peer"
        ? "bg-sky-500 dark:bg-sky-400"
        : "bg-teal-600 dark:bg-teal-400";

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`flex items-end justify-center gap-1.5 ${
          size === "lg" ? "h-24" : "h-14"
        }`}
      >
        {Array.from({ length: barCount }).map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              barsRef.current[i] = el;
            }}
            className={`origin-bottom rounded-full transition-transform duration-75 ${barClass} ${
              size === "lg" ? "w-2" : "w-1.5"
            } h-full`}
            style={{ transform: "scaleY(0.18)" }}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
        {label}
      </p>
    </div>
  );
}
