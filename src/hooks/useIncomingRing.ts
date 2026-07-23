"use client";

import { useEffect, useRef } from "react";

function getAudioContextCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext ||
    null
  );
}

/** Dual-tone phone-style ring via Web Audio (no asset file). */
function startRingtone(ctx: AudioContext) {
  const master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(ctx.destination);

  const scheduleBurst = (at: number) => {
    const freqs = [440, 480] as const;
    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.45, at + 0.03);
      gain.gain.setValueAtTime(0.45, at + 0.35);
      gain.gain.linearRampToValueAtTime(0, at + 0.42);
      osc.connect(gain);
      gain.connect(master);
      osc.start(at);
      osc.stop(at + 0.45);
    }
  };

  const period = 2.4;
  let next = ctx.currentTime + 0.05;
  const timers: number[] = [];

  const queue = () => {
    scheduleBurst(next);
    scheduleBurst(next + 0.5);
    next += period;
    const delayMs = Math.max(0, (next - ctx.currentTime - 0.1) * 1000);
    timers.push(window.setTimeout(queue, delayMs));
  };
  queue();

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
    try {
      master.disconnect();
    } catch {
      /* already closed */
    }
  };
}

function showIncomingNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!document.hidden) return;

  try {
    const options: NotificationOptions & { renotify?: boolean } = {
      body,
      tag: "talko-incoming",
      renotify: true,
      silent: false,
    };
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      n.close();
    };
    return n;
  } catch {
    return undefined;
  }
}

/**
 * Plays a looping ringtone + vibration while an invite is showing.
 * Also fires a system notification if the tab is hidden and permission was granted.
 */
export function useIncomingRing(opts: {
  active: boolean;
  title: string;
  body: string;
}) {
  const { active, title, body } = opts;
  const stopRef = useRef<(() => void) | null>(null);
  const notifRef = useRef<Notification | null>(null);

  useEffect(() => {
    if (!active) return;

    const Ctor = getAudioContextCtor();
    let cancelled = false;
    let stopRing: (() => void) | null = null;
    let ctx: AudioContext | null = null;

    const start = async () => {
      if (!Ctor) return;
      ctx = new Ctor();
      try {
        await ctx.resume();
      } catch {
        /* autoplay policy — may still work after prior gesture */
      }
      if (cancelled) {
        void ctx.close();
        return;
      }
      stopRing = startRingtone(ctx);
      stopRef.current = () => {
        stopRing?.();
        void ctx?.close();
      };
    };

    void start();

    try {
      navigator.vibrate?.([200, 100, 200, 100, 200, 600]);
    } catch {
      /* ignore */
    }

    const vibrateLoop = window.setInterval(() => {
      try {
        navigator.vibrate?.([200, 100, 200, 100, 200, 600]);
      } catch {
        /* ignore */
      }
    }, 2400);

    const notif = showIncomingNotification(title, body);
    if (notif) notifRef.current = notif;

    const onVisibility = () => {
      if (!document.hidden) {
        notifRef.current?.close();
        notifRef.current = null;
      } else if (!notifRef.current) {
        const n = showIncomingNotification(title, body);
        if (n) notifRef.current = n;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(vibrateLoop);
      try {
        navigator.vibrate?.(0);
      } catch {
        /* ignore */
      }
      document.removeEventListener("visibilitychange", onVisibility);
      stopRing?.();
      stopRef.current = null;
      void ctx?.close();
      notifRef.current?.close();
      notifRef.current = null;
    };
  }, [active, title, body]);
}
