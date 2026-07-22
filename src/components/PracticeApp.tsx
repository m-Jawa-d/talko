"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActiveCall } from "@/components/ActiveCall";
import { CallFeedback } from "@/components/CallFeedback";
import { ConfigMissing } from "@/components/ConfigMissing";
import { IncomingCall } from "@/components/IncomingCall";
import { PracticeLobby } from "@/components/PracticeLobby";
import { ProfileSetup } from "@/components/ProfileSetup";
import { SiteFooter, SiteHeader, SiteNavPill } from "@/components/SiteHeader";
import { useLobby } from "@/hooks/useLobby";
import { useProfile } from "@/hooks/useProfile";
import { useWebRTC } from "@/hooks/useWebRTC";
import { loadHistory, saveHistoryEntry } from "@/lib/history";
import { pickPartner } from "@/lib/levels";
import { getRoom, loadRoomId, saveRoomId } from "@/lib/rooms";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  CallHistoryEntry,
  CallRatingTag,
  LanguageLevel,
  PresenceUser,
  RoomId,
  SignalPayload,
} from "@/types";

type Phase = "idle" | "looking" | "outgoing" | "incoming" | "active";

interface PendingFeedback {
  peerId: string;
  peerName: string;
  peerLevel: LanguageLevel;
  durationSeconds: number;
  prompt?: string;
  roomId: RoomId;
}

const MIN_FEEDBACK_SECONDS = 20;

export function PracticeApp() {
  const { profile, hydrated, updateProfile, resetProfile } = useProfile();
  const [phase, setPhase] = useState<Phase>("idle");
  const [peer, setPeer] = useState<PresenceUser | null>(null);
  const [incoming, setIncoming] = useState<PresenceUser | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [history, setHistory] = useState<CallHistoryEntry[]>([]);
  const [roomId, setRoomId] = useState<RoomId>("open");
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(
    null
  );
  const [configured] = useState(() => isSupabaseConfigured());

  const peerIdRef = useRef<string | null>(null);
  const lookingTimerRef = useRef<number | null>(null);
  const matchedRef = useRef(false);
  const phaseRef = useRef<Phase>("idle");
  const callStartedAtRef = useRef<number | null>(null);
  const callConnectedRef = useRef(false);
  const lastPromptRef = useRef<string | undefined>(undefined);
  const roomIdRef = useRef<RoomId>(roomId);
  const peerSnapshotRef = useRef<{
    id: string;
    displayName: string;
    level: LanguageLevel;
  } | null>(null);

  roomIdRef.current = roomId;

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

  useEffect(() => {
    setHistory(loadHistory());
    setRoomId(loadRoomId());
  }, []);

  const handleRoomChange = (next: RoomId) => {
    if (phaseRef.current !== "idle") return;
    setRoomId(next);
    saveRoomId(next);
    setBanner(null);
  };

  const clearLookingTimer = useCallback(() => {
    if (lookingTimerRef.current) {
      window.clearTimeout(lookingTimerRef.current);
    }
    lookingTimerRef.current = null;
  }, []);

  const setPhaseSafe = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const buildFeedbackIfNeeded = useCallback((): PendingFeedback | null => {
    const snap = peerSnapshotRef.current;
    const started = callStartedAtRef.current;
    if (!snap || !started || !callConnectedRef.current) return null;
    const durationSeconds = Math.max(
      0,
      Math.round((Date.now() - started) / 1000)
    );
    if (durationSeconds < MIN_FEEDBACK_SECONDS) return null;
    return {
      peerId: snap.id,
      peerName: snap.displayName,
      peerLevel: snap.level,
      durationSeconds,
      prompt: lastPromptRef.current,
      roomId: roomIdRef.current,
    };
  }, []);

  const resetCallUi = useCallback(
    async (opts?: { offerFeedback?: boolean }) => {
      const feedback =
        opts?.offerFeedback !== false ? buildFeedbackIfNeeded() : null;

      clearLookingTimer();
      matchedRef.current = false;
      hangUpRef.current();
      peerIdRef.current = null;
      callStartedAtRef.current = null;
      callConnectedRef.current = false;
      lastPromptRef.current = undefined;
      peerSnapshotRef.current = null;
      setPeer(null);
      setIncoming(null);
      setPhaseSafe("idle");
      setBanner(null);
      await setPresenceRef.current("Online");

      if (feedback) setPendingFeedback(feedback);
      return feedback;
    },
    [buildFeedbackIfNeeded, clearLookingTimer, setPhaseSafe]
  );

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

  useEffect(() => {
    if (phase !== "active") return;
    if (webrtc.connectionState === "connected" && !callConnectedRef.current) {
      callConnectedRef.current = true;
      callStartedAtRef.current = Date.now();
    }
  }, [phase, webrtc.connectionState]);

  const rememberPeer = useCallback((user: PresenceUser) => {
    peerSnapshotRef.current = {
      id: user.id,
      displayName: user.displayName,
      level: user.level,
    };
  }, []);

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
          rememberPeer(signal.from);
          setIncoming(signal.from);
          setPeer(signal.from);
          peerIdRef.current = signal.from.id;
          setPhaseSafe("incoming");
          await setPresenceRef.current("Busy");
          break;
        }
        case "call-accept": {
          peerIdRef.current = signal.from.id;
          rememberPeer(signal.from);
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
            await resetCallUi({ offerFeedback: false });
          }
          break;
        }
        case "call-decline": {
          setBanner(`${signal.from.displayName} declined the call.`);
          await resetCallUi({ offerFeedback: false });
          break;
        }
        case "call-end": {
          const wasActive = phaseRef.current === "active";
          const feedback = await resetCallUi();
          if (wasActive && !feedback) {
            setBanner("The other person left the call.");
          }
          break;
        }
        case "webrtc-offer": {
          if (!signal.sdp) return;
          peerIdRef.current = signal.from.id;
          rememberPeer(signal.from);
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
            await resetCallUi({ offerFeedback: false });
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
    [clearLookingTimer, rememberPeer, resetCallUi, setPhaseSafe]
  );

  const lobby = useLobby({
    profile,
    roomId,
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
    rememberPeer(user);
    setPeer(user);
    setPhaseSafe("outgoing");
    setBanner(`Calling ${user.displayName}…`);
    await lobby.setPresenceStatus("Busy");
    await lobby.sendSignal({ type: "call-invite", toId: user.id });
  };

  const tryMatch = useCallback(async () => {
    if (matchedRef.current) return;
    const meId = profile?.id;
    const myLevel = profile?.level;
    if (!meId || !myLevel) return;

    const candidates = lobby.users.filter(
      (u) => u.status === "Looking" || u.status === "Online"
    );
    const partner = pickPartner(candidates, myLevel, meId);
    if (!partner) return;

    matchedRef.current = true;
    clearLookingTimer();
    peerIdRef.current = partner.id;
    rememberPeer(partner);
    setPeer(partner);
    setPhaseSafe("outgoing");
    setBanner(`Matched with ${partner.displayName}…`);
    await lobby.setPresenceStatus("Busy");
    await lobby.sendSignal({ type: "call-invite", toId: partner.id });
  }, [
    lobby,
    profile?.id,
    profile?.level,
    clearLookingTimer,
    rememberPeer,
    setPhaseSafe,
  ]);

  useEffect(() => {
    if (phase !== "looking") return;
    void tryMatch();
  }, [phase, lobby.users, tryMatch]);

  const handleFindPartner = async () => {
    if (!lobby.ready || phase !== "idle") return;
    matchedRef.current = false;
    setPhaseSafe("looking");
    setBanner(
      `Looking in ${getRoom(roomId).name} for a partner near your level…`
    );
    await lobby.setPresenceStatus("Looking");

    lookingTimerRef.current = window.setTimeout(() => {
      if (!matchedRef.current) {
        setBanner("No partner found yet. Stay online or try another room.");
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
    rememberPeer(incoming);
    setIncoming(null);
    setPhaseSafe("active");
    await lobby.setPresenceStatus("In Call");
    await lobby.sendSignal({ type: "call-accept", toId: incoming.id });
  };

  const handleDecline = async () => {
    if (!incoming) return;
    await lobby.sendSignal({ type: "call-decline", toId: incoming.id });
    await resetCallUi({ offerFeedback: false });
  };

  const handleEndCall = async () => {
    const toId = peerIdRef.current;
    const failed = Boolean(webrtc.failureReason);
    if (toId) {
      await lobby.sendSignal({ type: "call-end", toId });
    }
    await resetCallUi({ offerFeedback: !failed });
    if (failed) {
      setBanner(
        "Call couldn’t connect. Try again — different networks sometimes block audio until TURN is set up."
      );
    }
  };

  const persistFeedback = (input: {
    ratings: CallRatingTag[];
    note: string;
  }) => {
    if (!pendingFeedback) return;
    const next = saveHistoryEntry({
      peerId: pendingFeedback.peerId,
      peerName: pendingFeedback.peerName,
      peerLevel: pendingFeedback.peerLevel,
      durationSeconds: pendingFeedback.durationSeconds,
      ratings: input.ratings,
      note: input.note,
      prompt: pendingFeedback.prompt,
      roomId: pendingFeedback.roomId,
    });
    setHistory(next);
    setPendingFeedback(null);
  };

  const skipFeedback = () => {
    if (!pendingFeedback) return;
    const next = saveHistoryEntry({
      peerId: pendingFeedback.peerId,
      peerName: pendingFeedback.peerName,
      peerLevel: pendingFeedback.peerLevel,
      durationSeconds: pendingFeedback.durationSeconds,
      ratings: [],
      prompt: pendingFeedback.prompt,
      roomId: pendingFeedback.roomId,
    });
    setHistory(next);
    setPendingFeedback(null);
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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[-10%] h-[55vh] w-[55vh] rounded-full bg-teal-400/15 blur-3xl animate-[call-orb_16s_ease-in-out_infinite_alternate] dark:bg-teal-400/10" />
        <div className="absolute -right-20 bottom-[-8%] h-[45vh] w-[45vh] rounded-full bg-sky-400/10 blur-3xl animate-[call-orb_18s_ease-in-out_infinite_alternate-reverse] dark:bg-sky-400/8" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--page-bg)_78%)]" />
      </div>

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
                  void resetCallUi({ offerFeedback: false });
                  resetProfile();
                }}
              >
                Edit profile
              </SiteNavPill>
            </>
          }
        />

        <main className="flex flex-1 flex-col py-8 sm:py-12">
          <PracticeLobby
            profile={profile}
            roomId={roomId}
            statusLabel={statusLabel}
            ready={lobby.ready}
            phase={
              phase === "looking" || phase === "outgoing" ? phase : "idle"
            }
            users={lobby.users}
            history={history}
            error={lobby.error}
            banner={banner}
            onRoomChange={handleRoomChange}
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
          roomId={roomId}
          localStream={webrtc.localStream}
          remoteStream={webrtc.remoteStream}
          connectionState={webrtc.connectionState}
          failureReason={webrtc.failureReason}
          isMuted={webrtc.isMuted}
          onToggleMute={webrtc.toggleMute}
          onEndCall={() => void handleEndCall()}
          onPromptChange={(p) => {
            lastPromptRef.current = p.text;
          }}
        />
      ) : null}

      {pendingFeedback ? (
        <CallFeedback
          peerName={pendingFeedback.peerName}
          peerLevel={pendingFeedback.peerLevel}
          durationSeconds={pendingFeedback.durationSeconds}
          onSubmit={persistFeedback}
          onSkip={skipFeedback}
        />
      ) : null}
    </div>
  );
}
