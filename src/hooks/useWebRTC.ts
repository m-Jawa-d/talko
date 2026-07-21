"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STUN_SERVERS } from "@/types";

const CONNECT_TIMEOUT_MS = 25_000;

export type CallFailureReason =
  | "failed"
  | "timeout"
  | "disconnected"
  | "mic-denied"
  | "mic-error";

interface UseWebRTCOptions {
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onCallFailed?: (reason: CallFailureReason) => void;
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function micFailureReason(err: unknown): CallFailureReason {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      return "mic-denied";
    }
  }
  return "mic-error";
}

export function useWebRTC({ onIceCandidate, onCallFailed }: UseWebRTCOptions) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const connectTimerRef = useRef<number | null>(null);
  const hasConnectedRef = useRef(false);
  const failedRef = useRef(false);

  const onIceCandidateRef = useRef(onIceCandidate);
  const onCallFailedRef = useRef(onCallFailed);
  onIceCandidateRef.current = onIceCandidate;
  onCallFailedRef.current = onCallFailed;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");
  const [failureReason, setFailureReason] = useState<CallFailureReason | null>(
    null
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  const clearConnectTimer = useCallback(() => {
    if (connectTimerRef.current) {
      window.clearTimeout(connectTimerRef.current);
      connectTimerRef.current = null;
    }
  }, []);

  const reportFailure = useCallback(
    (reason: CallFailureReason) => {
      if (failedRef.current) return;
      failedRef.current = true;
      clearConnectTimer();
      console.warn(`[webrtc] call failed: ${reason}`);
      setFailureReason(reason);
      onCallFailedRef.current?.(reason);
    },
    [clearConnectTimer]
  );

  const startConnectWatch = useCallback(() => {
    clearConnectTimer();
    hasConnectedRef.current = false;
    failedRef.current = false;
    setFailureReason(null);

    connectTimerRef.current = window.setTimeout(() => {
      if (!hasConnectedRef.current) {
        reportFailure("timeout");
      }
    }, CONNECT_TIMEOUT_MS);
  }, [clearConnectTimer, reportFailure]);

  const ensurePeerConnection = useCallback(() => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
    console.log("[webrtc] peer connection created");

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidateRef.current(event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      console.log("[webrtc] remote track", event.track.kind);
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      remoteStreamRef.current = stream;
      setRemoteStream(stream);
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log(`[webrtc] connectionState → ${state}`);
      setConnectionState(state);

      if (state === "connected") {
        hasConnectedRef.current = true;
        clearConnectTimer();
        setFailureReason(null);
        return;
      }

      if (state === "failed") {
        reportFailure("failed");
        return;
      }

      if (state === "disconnected" && hasConnectedRef.current) {
        // Brief blips are normal; give ICE a moment before declaring failure
        window.setTimeout(() => {
          if (
            pcRef.current?.connectionState === "disconnected" ||
            pcRef.current?.connectionState === "failed"
          ) {
            reportFailure("disconnected");
          }
        }, 8_000);
      }
    };

    pc.oniceconnectionstatechange = () => {
      const ice = pc.iceConnectionState;
      console.log(`[webrtc] iceConnectionState → ${ice}`);
      if (ice === "failed") {
        reportFailure("failed");
      }
    };

    pcRef.current = pc;
    return pc;
  }, [clearConnectTimer, reportFailure]);

  const getLocalAudio = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      reportFailure(micFailureReason(err));
      throw err;
    }
  }, [reportFailure]);

  const attachLocalTracks = useCallback(
    async (pc: RTCPeerConnection) => {
      const stream = await getLocalAudio();
      for (const track of stream.getTracks()) {
        const already = pc
          .getSenders()
          .some((sender) => sender.track?.id === track.id);
        if (!already) pc.addTrack(track, stream);
      }
    },
    [getLocalAudio]
  );

  const flushCandidates = useCallback(async (pc: RTCPeerConnection) => {
    for (const candidate of pendingCandidatesRef.current) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
    pendingCandidatesRef.current = [];
  }, []);

  const createOffer = useCallback(async () => {
    const pc = ensurePeerConnection();
    await attachLocalTracks(pc);
    setIsInCall(true);
    startConnectWatch();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log("[webrtc] offer created");
    return offer;
  }, [attachLocalTracks, ensurePeerConnection, startConnectWatch]);

  const handleOffer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      const pc = ensurePeerConnection();
      await attachLocalTracks(pc);
      setIsInCall(true);
      startConnectWatch();
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await flushCandidates(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log("[webrtc] answer created");
      return answer;
    },
    [attachLocalTracks, ensurePeerConnection, flushCandidates, startConnectWatch]
  );

  const handleAnswer = useCallback(
    async (sdp: RTCSessionDescriptionInit) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await flushCandidates(pc);
      console.log("[webrtc] answer applied");
    },
    [flushCandidates]
  );

  const handleRemoteIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      const pc = pcRef.current;
      if (!pc || !pc.remoteDescription) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("[webrtc] addIceCandidate failed", err);
      }
    },
    []
  );

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !isMuted;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !next;
    });
    setIsMuted(next);
  }, [isMuted]);

  const hangUp = useCallback(() => {
    console.log("[webrtc] hang up");
    clearConnectTimer();
    failedRef.current = false;
    hasConnectedRef.current = false;

    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    stopStream(localStreamRef.current);
    stopStream(remoteStreamRef.current);
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    pendingCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState("closed");
    setFailureReason(null);
    setIsMuted(false);
    setIsInCall(false);
  }, [clearConnectTimer]);

  useEffect(() => {
    const onUnload = () => {
      stopStream(localStreamRef.current);
      stopStream(remoteStreamRef.current);
      pcRef.current?.close();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      hangUp();
    };
  }, [hangUp]);

  return {
    localStream,
    remoteStream,
    connectionState,
    failureReason,
    isMuted,
    isInCall,
    createOffer,
    handleOffer,
    handleAnswer,
    handleRemoteIceCandidate,
    toggleMute,
    hangUp,
  };
}
