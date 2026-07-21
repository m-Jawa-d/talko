"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActiveCall } from "@/components/ActiveCall";
import { ConfigMissing } from "@/components/ConfigMissing";
import { IncomingCall } from "@/components/IncomingCall";
import { PracticeLobby } from "@/components/PracticeLobby";
import { ProfileSetup } from "@/components/ProfileSetup";
import { SiteFooter, SiteHeader, SiteNavPill } from "@/components/SiteHeader";
import { useLobby } from "@/hooks/useLobby";
import { useProfile } from "@/hooks/useProfile";
import { useWebRTC } from "@/hooks/useWebRTC";
import { isSupabaseConfigured } from "@/lib/supabase";
import { PresenceUser, SignalPayload } from "@/types";

type Phase = "idle" | "looking" | "outgoing" | "incoming" | "active";

export function PracticeApp() {
  const { profile, hydrated, updateProfile, resetProfile } = useProfile();
  const [phase, setPhase] = useState<Phase>("idle");
  const [peer, setPeer] = useState<PresenceUser | null>(null);
  const [incoming, setIncoming] = useState<PresenceUser | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [configured] = useState(() => isSupabaseConfigured());

  const peerIdRef = useRef<string | null>(null);
  const lookingTimerRef = useRef<number | null>(null);
  const matchedRef = useRef(false);
  const phaseRef = useRef<Phase>("idle");

  const sendSignalRef = useRef<
    (payload: Omit<SignalPayload, "from">) => Promise<void>
  >(async () => undefined);
  const setPresenceRef = useRef<(s: PresenceUser["status"]) => Promise<void>>(
    async () => undefined
  );
  const hangUpRef = useRef<() => void>(() => undefined);
  const createOfferRef = useRef<() => Promise<RTCSessionDescriptionInit>>(
    async () => {
      throw new Error("not ready");
    }
  );
  const handleOfferRef = useRef<
    (sdp: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>
  >(async () => {
    throw new Error("not ready");
  });
  const handleAnswerRef = useRef<(sdp: RTCSessionDescriptionInit) => Promise<void>>(
    async () => undefined
  );
  const handleIceRef = useRef<(c: RTCIceCandidateInit) => Promise<void>>(
    async () => undefined
  );

  const clearLookingTimer = useCallback(() => {
    if (lookingTimerRef.current) {
      window.clearTimeout(lookingTimerRef.current);
      lookingTimerRef.current = null;
    }
  }, []);

  const setPhaseSafe = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const resetCallUi = useCallback(async () => {
    clearLookingTimer();
    matchedRef.current = false;
    hangUpRef.current();
    peerIdRef.current = null;
    setPeer(null);
    setIncoming(null);
    setPhaseSafe("idle");
    setBanner(null);
    await setPresenceRef.current("Online");
  }, [clearLookingTimer, setPhaseSafe]);

  const webrtc = useWebRTC({
    onIceCandidate: (candidate) => {
      const toId = peerIdRef.current;
      if (!toId) return;
      void sendSignalRef.current({
        type: "webrtc-ice",
        toId,
        candidate,
      });
    },
    onCallFailed: (reason) => {
      console.warn("[call] connection failed", reason);
      const toId = peerIdRef.current;
      if (toId) {
        void sendSignalRef.current({ type: "call-end", toId });
      }
    },
  });

  hangUpRef.current = webrtc.hangUp;
  createOfferRef.current = webrtc.createOffer;
  handleOfferRef.current = webrtc.handleOffer;
  handleAnswerRef.current = webrtc.handleAnswer;
  handleIceRef.current = webrtc.handleRemoteIceCandidate;

  const onSignal = useCallback(
    async (signal: SignalPayload) => {
      switch (signal.type) {
        case "call-invite": {
          const current = phaseRef.current;
          if (current !== "idle" && current !== "looking") {
            await sendSignalRef.current({
              type: "call-decline",
              toId: signal.from.id,
            });
            return;
          }
          clearLookingTimer();
          matchedRef.current = true;
          setIncoming(signal.from);
          setPeer(signal.from);
          peerIdRef.current = signal.from.id;
          setPhaseSafe("incoming");
          await setPresenceRef.current("Busy");
          break;
        }
        case "call-accept": {
          peerIdRef.current = signal.from.id;
          setPeer(signal.from);
          setPhaseSafe("active");
          setBanner(null);
          await setPresenceRef.current("In Call");
          try {
            const offer = await createOfferRef.current();
            await sendSignalRef.current({
              type: "webrtc-offer",
              toId: signal.from.id,
              sdp: offer,
            });
          } catch (err) {
            console.error("[call] offer failed", err);
            const msg =
              err instanceof DOMException &&
              (err.name === "NotAllowedError" ||
                err.name === "PermissionDeniedError")
                ? "Microphone permission is required to start a call."
                : "Couldn’t start the call. Check your microphone and try again.";
            setBanner(msg);
            await resetCallUi();
          }
          break;
        }
        case "call-decline": {
          setBanner(`${signal.from.displayName} declined the call.`);
          await resetCallUi();
          break;
        }
        case "call-end": {
          if (phaseRef.current === "active") {
            setBanner("The other person left the call.");
          }
          await resetCallUi();
          break;
        }
        case "webrtc-offer": {
          if (!signal.sdp) return;
          peerIdRef.current = signal.from.id;
          setPhaseSafe("active");
          await setPresenceRef.current("In Call");
          try {
            const answer = await handleOfferRef.current(signal.sdp);
            await sendSignalRef.current({
              type: "webrtc-answer",
              toId: signal.from.id,
              sdp: answer,
            });
          } catch (err) {
            console.error("[call] handle offer failed", err);
            const msg =
              err instanceof DOMException &&
              (err.name === "NotAllowedError" ||
                err.name === "PermissionDeniedError")
                ? "Microphone permission is required to join the call."
                : "Couldn’t join the call. Check your microphone and try again.";
            setBanner(msg);
            await resetCallUi();
          }
          break;
        }
        case "webrtc-answer": {
          if (!signal.sdp) return;
          await handleAnswerRef.current(signal.sdp);
          break;
        }
        case "webrtc-ice": {
          if (!signal.candidate) return;
          await handleIceRef.current(signal.candidate);
          break;
        }
      }
    },
    [clearLookingTimer, resetCallUi, setPhaseSafe]
  );

  const lobby = useLobby({
    profile,
    enabled: Boolean(profile) && configured,
    onSignal,
  });

  sendSignalRef.current = lobby.sendSignal;
  setPresenceRef.current = lobby.setPresenceStatus;

  const startCall = async (user: PresenceUser) => {
    if (phase !== "idle" && phase !== "looking") return;
    clearLookingTimer();
    matchedRef.current = true;
    peerIdRef.current = user.id;
    setPeer(user);
    setPhaseSafe("outgoing");
    setBanner(`Calling ${user.displayName}…`);
    await lobby.setPresenceStatus("Busy");
    await lobby.sendSignal({ type: "call-invite", toId: user.id });
  };

  const tryMatch = useCallback(async () => {
    if (matchedRef.current) return;
    const candidates = lobby.users.filter(
      (u) => u.status === "Looking" || u.status === "Online"
    );
    // Prefer others who are also looking; fall back to any online
    const looking = candidates.filter((u) => u.status === "Looking");
    const pool = looking.length > 0 ? looking : candidates;
    if (pool.length === 0) return;

    // Deterministic pairing: lower id invites to avoid double-call races when both looking
    const meId = profile?.id;
    if (!meId) return;

    const partner = pool[Math.floor(Math.random() * pool.length)];
    if (!partner) return;

    if (partner.status === "Looking" && partner.id < meId) {
      // Let the other peer initiate
      return;
    }

    matchedRef.current = true;
    clearLookingTimer();
    peerIdRef.current = partner.id;
    setPeer(partner);
    setPhaseSafe("outgoing");
    setBanner(`Matched with ${partner.displayName}…`);
    await lobby.setPresenceStatus("Busy");
    await lobby.sendSignal({ type: "call-invite", toId: partner.id });
  }, [lobby, profile?.id, clearLookingTimer, setPhaseSafe]);

  useEffect(() => {
    if (phase !== "looking") return;
    void tryMatch();
  }, [phase, lobby.users, tryMatch]);

  const handleFindPartner = async () => {
    if (!lobby.ready || phase !== "idle") return;
    matchedRef.current = false;
    setPhaseSafe("looking");
    setBanner("Looking for a partner…");
    await lobby.setPresenceStatus("Looking");

    lookingTimerRef.current = window.setTimeout(() => {
      if (!matchedRef.current) {
        setBanner("No partner found yet. Stay online or try again.");
        void lobby.setPresenceStatus("Online");
        setPhaseSafe("idle");
      }
    }, 45000);
  };

  const cancelLooking = async () => {
    clearLookingTimer();
    matchedRef.current = false;
    setBanner(null);
    setPhaseSafe("idle");
    await lobby.setPresenceStatus("Online");
  };

  const handleAccept = async () => {
    if (!incoming) return;
    setIncoming(null);
    setPhaseSafe("active");
    await lobby.setPresenceStatus("In Call");
    await lobby.sendSignal({ type: "call-accept", toId: incoming.id });
  };

  const handleDecline = async () => {
    if (!incoming) return;
    await lobby.sendSignal({ type: "call-decline", toId: incoming.id });
    await resetCallUi();
  };

  const handleEndCall = async () => {
    const toId = peerIdRef.current;
    const failed = Boolean(webrtc.failureReason);
    if (toId) {
      await lobby.sendSignal({ type: "call-end", toId });
    }
    await resetCallUi();
    if (failed) {
      setBanner(
        "Call couldn’t connect. Try again — different networks sometimes block audio until TURN is set up."
      );
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-stone-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[var(--page-bg)]">
        <div className="mx-auto w-full max-w-6xl flex-1 px-6 pt-7 sm:px-10 lg:px-12">
          <SiteHeader action={<SiteNavPill href="/">Home</SiteNavPill>} />
          <div className="flex items-center py-20">
            <ConfigMissing />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[var(--page-bg)]">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-7 sm:px-10 lg:px-12">
          <SiteHeader action={<SiteNavPill href="/">Home</SiteNavPill>} />
          <div className="flex flex-1 items-center py-16">
            <ProfileSetup onSave={updateProfile} />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const statusLabel = !lobby.ready
    ? "Connecting"
    : lobby.myStatus === "Looking"
      ? "Looking"
      : lobby.myStatus === "Online"
        ? "Online"
        : lobby.myStatus;

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-[var(--page-bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_0%_0%,var(--accent-soft),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_20%,rgba(120,113,108,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_70%_45%_at_0%_0%,var(--accent-soft),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_10%,rgba(255,255,255,0.03),transparent_50%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-7 sm:px-10 lg:px-12">
        <SiteHeader
          action={
            <>
              <Link
                href="/guide"
                className="hidden text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:inline dark:text-stone-400 dark:hover:text-stone-100"
              >
                Guide
              </Link>
              <SiteNavPill
                onClick={() => {
                  void resetCallUi();
                  resetProfile();
                }}
              >
                Edit profile
              </SiteNavPill>
            </>
          }
        />

        <main className="flex flex-1 flex-col justify-center py-14 lg:py-10">
          <PracticeLobby
            profile={profile}
            statusLabel={statusLabel}
            ready={lobby.ready}
            phase={
              phase === "looking" || phase === "outgoing" ? phase : "idle"
            }
            users={lobby.users}
            error={lobby.error}
            banner={banner}
            onFindPartner={() => void handleFindPartner()}
            onCancelLooking={() => void cancelLooking()}
            onCancelOutgoing={() => void handleEndCall()}
            onCall={(user) => void startCall(user)}
          />
        </main>
      </div>

      <SiteFooter />

      {phase === "incoming" && incoming ? (
        <IncomingCall
          caller={incoming}
          onAccept={() => void handleAccept()}
          onDecline={() => void handleDecline()}
        />
      ) : null}

      {phase === "active" && peer ? (
        <ActiveCall
          peerName={peer.displayName}
          peerLevel={peer.level}
          localStream={webrtc.localStream}
          remoteStream={webrtc.remoteStream}
          connectionState={webrtc.connectionState}
          failureReason={webrtc.failureReason}
          isMuted={webrtc.isMuted}
          onToggleMute={webrtc.toggleMute}
          onEndCall={() => void handleEndCall()}
        />
      ) : null}
    </div>
  );
}
