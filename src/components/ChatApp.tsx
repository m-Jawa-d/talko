"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActiveChat } from "@/components/ActiveChat";
import { IncomingCall } from "@/components/IncomingCall";
import { OutgoingInvite } from "@/components/OutgoingInvite";
import {
  PracticeBackLink,
  PracticeChrome,
  PracticeGate,
} from "@/components/practice/PracticeGate";
import { PracticeLobby } from "@/components/PracticeLobby";
import { SiteNavPill } from "@/components/SiteHeader";
import { useLobby } from "@/hooks/useLobby";
import {
  appendChatMessage,
  getChatThread,
  loadChatThreads,
} from "@/lib/chatHistory";
import { loadRoomId, saveRoomId } from "@/lib/rooms";
import {
  ChatMessage,
  ChatThread,
  LanguageLevel,
  LearningLanguage,
  PresenceUser,
  RoomId,
  SignalPayload,
  UserProfile,
} from "@/types";

type Phase = "idle" | "outgoing" | "incoming" | "active";

function makeMessageId() {
  return crypto.randomUUID();
}

function ChatAppInner({
  profile,
  resetProfile,
}: {
  profile: UserProfile;
  resetProfile: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [peer, setPeer] = useState<PresenceUser | null>(null);
  const [incoming, setIncoming] = useState<PresenceUser | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [roomId, setRoomId] = useState<RoomId>("open");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const peerIdRef = useRef<string | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const peerSnapshotRef = useRef<{
    id: string;
    displayName: string;
    level: LanguageLevel;
    learning: LearningLanguage;
  } | null>(null);

  const sendSignalRef = useRef<
    (payload: Omit<SignalPayload, "from">) => Promise<void>
  >(async () => undefined);
  const setPresenceRef = useRef<(s: PresenceUser["status"]) => Promise<void>>(
    async () => undefined
  );

  useEffect(() => {
    setThreads(loadChatThreads());
    setRoomId(loadRoomId());
  }, []);

  const handleRoomChange = (next: RoomId) => {
    if (phaseRef.current !== "idle") return;
    setRoomId(next);
    saveRoomId(next);
    setBanner(null);
  };

  const setPhaseSafe = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const rememberPeer = useCallback((user: PresenceUser) => {
    peerSnapshotRef.current = {
      id: user.id,
      displayName: user.displayName,
      level: user.level,
      learning: user.learning,
    };
  }, []);

  const persistMessage = useCallback(
    (msg: ChatMessage, peerInfo?: {
      id: string;
      displayName: string;
      level: LanguageLevel;
      learning: LearningLanguage;
    }) => {
      const snap = peerInfo ?? peerSnapshotRef.current;
      if (!snap) return;
      const next = appendChatMessage({
        peerId: snap.id,
        peerName: snap.displayName,
        peerLevel: snap.level,
        peerLearning: snap.learning,
        message: msg,
      });
      setThreads(next);
    },
    []
  );

  const appendMessage = useCallback(
    (msg: ChatMessage, persist = true) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (persist) persistMessage(msg);
    },
    [persistMessage]
  );

  const loadThreadForPeer = useCallback((user: PresenceUser) => {
    const thread = getChatThread(user.id);
    setMessages(thread?.messages ?? []);
  }, []);

  const resetSessionUi = useCallback(async () => {
    peerIdRef.current = null;
    peerSnapshotRef.current = null;
    setMessages([]);
    setPeer(null);
    setIncoming(null);
    setPhaseSafe("idle");
    setBanner(null);
    setThreads(loadChatThreads());
    await setPresenceRef.current("Online");
  }, [setPhaseSafe]);

  const onSignal = useCallback(
    async (signal: SignalPayload) => {
      switch (signal.type) {
        case "chat-invite": {
          const current = phaseRef.current;
          if (current !== "idle") {
            await sendSignalRef.current({
              type: "chat-decline",
              toId: signal.from.id,
            });
            return;
          }
          rememberPeer(signal.from);
          loadThreadForPeer(signal.from);
          setIncoming(signal.from);
          setPeer(signal.from);
          peerIdRef.current = signal.from.id;
          setPhaseSafe("incoming");
          await setPresenceRef.current("Busy");
          break;
        }
        case "call-invite": {
          // Peer is on Chat mode — decline so they aren't left waiting
          await sendSignalRef.current({
            type: "call-decline",
            toId: signal.from.id,
          });
          break;
        }
        case "chat-accept": {
          peerIdRef.current = signal.from.id;
          rememberPeer(signal.from);
          loadThreadForPeer(signal.from);
          setPeer(signal.from);
          setPhaseSafe("active");
          setBanner(null);
          await setPresenceRef.current("In Chat");
          break;
        }
        case "chat-decline": {
          setBanner(`${signal.from.displayName} declined the chat.`);
          await resetSessionUi();
          break;
        }
        case "chat-end": {
          const wasActive = phaseRef.current === "active";
          await resetSessionUi();
          if (wasActive) {
            setBanner("The other person left the chat.");
          }
          break;
        }
        case "chat-message": {
          if (!signal.text || !signal.messageId) return;
          if (signal.from.id !== peerIdRef.current) return;
          appendMessage({
            id: signal.messageId,
            fromId: signal.from.id,
            text: signal.text,
            sentAt: Date.now(),
          });
          break;
        }
        default:
          break;
      }
    },
    [
      appendMessage,
      loadThreadForPeer,
      rememberPeer,
      resetSessionUi,
      setPhaseSafe,
    ]
  );

  const lobby = useLobby({
    profile,
    roomId,
    enabled: true,
    onSignal,
  });

  sendSignalRef.current = lobby.sendSignal;
  setPresenceRef.current = lobby.setPresenceStatus;

  const startChat = async (user: PresenceUser) => {
    if (phase !== "idle") return;
    peerIdRef.current = user.id;
    rememberPeer(user);
    loadThreadForPeer(user);
    setPeer(user);
    setPhaseSafe("outgoing");
    setBanner(`Chatting with ${user.displayName}…`);
    await lobby.setPresenceStatus("Busy");
    await lobby.sendSignal({ type: "chat-invite", toId: user.id });
  };

  const startChatFromThread = async (thread: ChatThread) => {
    const online = lobby.users.find(
      (u) =>
        u.id === thread.peerId &&
        (u.status === "Online" || u.status === "Looking")
    );
    if (!online) {
      setBanner(`${thread.peerName} isn’t online right now.`);
      return;
    }
    await startChat(online);
  };

  const handleAccept = async () => {
    if (!incoming) return;
    rememberPeer(incoming);
    loadThreadForPeer(incoming);
    setIncoming(null);
    setPhaseSafe("active");
    await lobby.setPresenceStatus("In Chat");
    await lobby.sendSignal({ type: "chat-accept", toId: incoming.id });
  };

  const handleDecline = async () => {
    if (!incoming) return;
    await lobby.sendSignal({ type: "chat-decline", toId: incoming.id });
    await resetSessionUi();
  };

  const handleEndSession = async () => {
    const toId = peerIdRef.current;
    if (toId) {
      await lobby.sendSignal({ type: "chat-end", toId });
    }
    await resetSessionUi();
  };

  const sendChatMessage = async (text: string) => {
    const toId = peerIdRef.current;
    if (!toId || !profile) return;
    const message: ChatMessage = {
      id: makeMessageId(),
      fromId: profile.id,
      text,
      sentAt: Date.now(),
    };
    appendMessage(message);
    await lobby.sendSignal({
      type: "chat-message",
      toId,
      text: message.text,
      messageId: message.id,
    });
  };

  const statusLabel = !lobby.ready
    ? "Connecting"
    : lobby.myStatus === "Online"
      ? "Online"
      : lobby.myStatus;

  return (
    <>
      <PracticeChrome
        action={
          <>
            <PracticeBackLink />
            <Link
              href="/guide"
              className="hidden text-sm font-medium text-stone-600 transition hover:text-stone-900 sm:inline dark:text-stone-400 dark:hover:text-stone-100"
            >
              Guide
            </Link>
            <SiteNavPill
              onClick={() => {
                void resetSessionUi();
                resetProfile();
              }}
            >
              Edit profile
            </SiteNavPill>
          </>
        }
      >
        <PracticeLobby
          mode="chat"
          profile={profile}
          roomId={roomId}
          statusLabel={statusLabel}
          ready={lobby.ready}
          phase={phase === "outgoing" ? "outgoing" : "idle"}
          users={lobby.users}
          chatThreads={threads}
          error={lobby.error}
          banner={banner}
          outgoingUserId={phase === "outgoing" ? peer?.id : null}
          onRoomChange={handleRoomChange}
          onCancelOutgoing={() => void handleEndSession()}
          onConnect={(user) => void startChat(user)}
          onMessageAgain={(thread) => void startChatFromThread(thread)}
        />
      </PracticeChrome>

      {phase === "outgoing" && peer ? (
        <OutgoingInvite
          peer={peer}
          kind="chat"
          onCancel={() => void handleEndSession()}
        />
      ) : null}

      {phase === "incoming" && incoming ? (
        <IncomingCall
          caller={incoming}
          kind="chat"
          onAccept={() => void handleAccept()}
          onDecline={() => void handleDecline()}
        />
      ) : null}

      {phase === "active" && peer ? (
        <ActiveChat
          peerName={peer.displayName}
          peerLevel={peer.level}
          peerLearning={peer.learning}
          myId={profile.id}
          roomId={roomId}
          messages={messages}
          onSend={(text) => void sendChatMessage(text)}
          onEndChat={() => void handleEndSession()}
        />
      ) : null}
    </>
  );
}

export function ChatApp() {
  return (
    <PracticeGate>
      {({ profile, resetProfile }) => (
        <ChatAppInner profile={profile} resetProfile={resetProfile} />
      )}
    </PracticeGate>
  );
}
