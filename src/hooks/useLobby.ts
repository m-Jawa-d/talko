"use client";

import { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  LOBBY_CHANNEL,
  PresenceStatus,
  PresenceUser,
  SignalPayload,
  UserProfile,
} from "@/types";

function presenceList(state: Record<string, PresenceUser[]>): PresenceUser[] {
  const map = new Map<string, PresenceUser>();
  for (const presets of Object.values(state)) {
    for (const user of presets) {
      if (user?.id) map.set(user.id, user);
    }
  }
  return Array.from(map.values());
}

interface UseLobbyOptions {
  profile: UserProfile | null;
  enabled: boolean;
  onSignal: (payload: SignalPayload) => void;
}

export function useLobby({ profile, enabled, onSignal }: UseLobbyOptions) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [status, setStatus] = useState<PresenceStatus>("Online");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const statusRef = useRef<PresenceStatus>("Online");
  const profileRef = useRef(profile);
  const onSignalRef = useRef(onSignal);

  profileRef.current = profile;
  onSignalRef.current = onSignal;
  statusRef.current = status;

  const trackPresence = useCallback(async (next: PresenceStatus) => {
    const channel = channelRef.current;
    const me = profileRef.current;
    if (!channel || !me) return;

    statusRef.current = next;
    setStatus(next);

    await channel.track({
      id: me.id,
      displayName: me.displayName,
      level: me.level,
      learning: me.learning,
      status: next,
    } satisfies PresenceUser);
  }, []);

  const sendSignal = useCallback(async (payload: Omit<SignalPayload, "from">) => {
    const channel = channelRef.current;
    const me = profileRef.current;
    if (!channel || !me) return;

    const full: SignalPayload = {
      ...payload,
      from: {
        id: me.id,
        displayName: me.displayName,
        level: me.level,
        learning: me.learning,
        status: statusRef.current,
      },
    };

    await channel.send({
      type: "broadcast",
      event: "signal",
      payload: full,
    });
  }, []);

  useEffect(() => {
    if (!enabled || !profile) {
      setReady(false);
      setUsers([]);
      return;
    }

    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured.");
      return;
    }

    let cancelled = false;
    const supabase = getSupabase();
    const channel = supabase.channel(LOBBY_CHANNEL, {
      config: {
        presence: { key: profile.id },
        broadcast: { self: false },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        setUsers(presenceList(channel.presenceState() as Record<string, PresenceUser[]>));
      })
      .on("broadcast", { event: "signal" }, ({ payload }) => {
        const signal = payload as SignalPayload;
        if (!signal?.toId || signal.toId !== profileRef.current?.id) return;
        onSignalRef.current(signal);
      })
      .subscribe(async (subscribeStatus, err) => {
        if (cancelled) return;

        if (subscribeStatus === "SUBSCRIBED") {
          setError(null);
          setReady(true);
          await trackPresence("Online");
          console.log("[lobby] joined", profile.id);
          return;
        }

        if (subscribeStatus === "CHANNEL_ERROR" || subscribeStatus === "TIMED_OUT") {
          console.error("[lobby] channel error", err);
          setError("Could not join the live lobby. Check your Supabase Realtime settings.");
          setReady(false);
        }
      });

    return () => {
      cancelled = true;
      setReady(false);
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [enabled, profile, trackPresence]);

  const others = users.filter((u) => u.id !== profile?.id);

  return {
    users: others,
    myStatus: status,
    ready,
    error,
    setPresenceStatus: trackPresence,
    sendSignal,
  };
}
