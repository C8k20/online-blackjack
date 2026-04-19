"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { RoomSnapshot } from "@/lib/socket-protocol";
import { CardBack } from "@/components/CardBack";
import { PlayingCard } from "@/components/PlayingCard";

function socketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://127.0.0.1:3001";
}

export function BlackjackRoom() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const s = io(socketUrl(), {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      setBanner(null);
    });
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", () => {
      setBanner(`Cannot reach game server at ${socketUrl()}. Start online-blackjack-server (npm run dev).`);
    });

    s.on("state", (snapshot: RoomSnapshot | null) => {
      if (snapshot) setRoom(snapshot);
      else {
        setRoom(null);
        setMyPlayerId(null);
      }
    });

    s.on("room:joined", (payload: { myPlayerId: string; room: RoomSnapshot }) => {
      setMyPlayerId(payload.myPlayerId);
      setRoom(payload.room);
    });

    return () => {
      s.removeAllListeners();
      s.close();
    };
  }, []);

  const runAck = useCallback(
    (err: unknown) => {
      if (err != null && err !== "") {
        setBanner(String(err));
      } else {
        setBanner(null);
      }
      setPending(false);
    },
    [],
  );

  const createRoom = () => {
    if (!socket || !displayName.trim()) return;
    setPending(true);
    setBanner(null);
    socket.emit("room:create", displayName.trim(), runAck);
  };

  const joinRoom = () => {
    if (!socket || !displayName.trim() || !joinCode.trim()) return;
    setPending(true);
    setBanner(null);
    socket.emit(
      "room:join",
      { code: joinCode.trim(), displayName: displayName.trim() },
      runAck,
    );
  };

  const leaveRoom = () => {
    if (!socket) return;
    socket.emit("room:leave");
    setRoom(null);
    setMyPlayerId(null);
    setBanner(null);
  };

  const startGame = () => {
    if (!socket) return;
    setPending(true);
    setBanner(null);
    socket.emit("game:start", runAck);
  };

  const nextGame = () => {
    if (!socket) return;
    setPending(true);
    setBanner(null);
    socket.emit("game:next", runAck);
  };

  const hit = () => {
    if (!socket) return;
    setPending(true);
    setBanner(null);
    socket.emit("action:hit", runAck);
  };

  const stand = () => {
    if (!socket) return;
    setPending(true);
    setBanner(null);
    socket.emit("action:stand", runAck);
  };

  const me = useMemo(
    () => room?.players.find((p) => p.id === myPlayerId) ?? null,
    [room, myPlayerId],
  );

  const isHost = !!(room && myPlayerId && room.hostPlayerId === myPlayerId);
  const canStart =
    isHost && room?.phase === "lobby" && (room.players.length ?? 0) >= 2 && !pending;
  const myTurn =
    room?.phase === "playing" &&
    myPlayerId &&
    room.currentPlayerId === myPlayerId &&
    me &&
    !me.bust &&
    !me.stood;

  const canHit = !!(myTurn && (room?.deckRemaining ?? 0) > 0);
  const canStand = !!myTurn;

  return (
    <div className="min-h-full flex flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Blackjack</h1>
          <div className="flex items-center gap-3 text-sm">
            <span
              className={
                connected
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }
            >
              {connected ? "Connected" : "Disconnected"}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">{socketUrl()}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4">
        {banner && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            {banner}
          </p>
        )}

        {!room ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-base font-medium">Join a room</h2>
            <label className="mb-2 block text-sm text-zinc-600 dark:text-zinc-400">
              Display name
              <input
                className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                maxLength={24}
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!connected || pending || !displayName.trim()}
                onClick={createRoom}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Create room
              </button>
            </div>
            <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <label className="mb-2 block text-sm text-zinc-600 dark:text-zinc-400">
                Room code
                <input
                  className="mt-1 w-full max-w-xs rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono uppercase tracking-widest text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABCD"
                  maxLength={6}
                />
              </label>
              <button
                type="button"
                disabled={!connected || pending || !displayName.trim() || !joinCode.trim()}
                onClick={joinRoom}
                className="mt-3 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-600"
              >
                Join room
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Room</p>
                <p className="font-mono text-2xl font-bold tracking-widest">{room.code}</p>
                {room.phase === "lobby" && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {room.players.length} player{room.players.length === 1 ? "" : "s"} — need 2 to
                    start
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {room.phase === "lobby" && isHost && (
                  <button
                    type="button"
                    disabled={!canStart}
                    onClick={startGame}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Start game
                  </button>
                )}
                {room.phase === "finished" && isHost && (
                  <button
                    type="button"
                    disabled={pending || room.players.length < 2}
                    onClick={nextGame}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Next game
                  </button>
                )}
                <button
                  type="button"
                  onClick={leaveRoom}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
                >
                  Leave room
                </button>
              </div>
            </section>

            {room.phase === "playing" && (
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                Other players&apos; cards and totals stay hidden until everyone still in the round has
                stood. Then all hands are revealed and the result is shown.
              </p>
            )}

            {room.outcomeMessage && room.phase === "finished" && (
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-base font-medium dark:border-zinc-800 dark:bg-zinc-900/50">
                {room.outcomeMessage}
              </p>
            )}

            <section className="space-y-6">
              {room.players.map((p) => {
                const isSelf = p.id === myPlayerId;
                const isCurrent = room.phase === "playing" && room.currentPlayerId === p.id;
                return (
                  <article
                    key={p.id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      isCurrent
                        ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/30 dark:bg-emerald-950/20"
                        : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                    }`}
                  >
                    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-medium">
                        {p.name}
                        {p.id === room.hostPlayerId && (
                          <span className="ml-2 text-xs font-normal text-zinc-500">(host)</span>
                        )}
                        {isSelf && (
                          <span className="ml-2 text-xs font-normal text-emerald-600 dark:text-emerald-400">
                            (you)
                          </span>
                        )}
                      </h3>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {p.bust && <span className="font-semibold text-red-600">Bust</span>}
                        {!p.bust && p.stood && (
                          <span className="font-semibold text-zinc-500">Standing</span>
                        )}
                        {!p.bust && p.handValue != null && (
                          <span className="ml-2">Total: {p.handValue}</span>
                        )}
                        {!p.bust && p.concealedCount > 0 && (
                          <span className="ml-2 text-zinc-400">Total hidden</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: p.concealedCount }).map((_, i) => (
                        <CardBack key={`${p.id}-concealed-${i}`} />
                      ))}
                      {p.hand.map((id) => (
                        <PlayingCard key={`${p.id}-${id}`} cardId={id} />
                      ))}
                    </div>
                  </article>
                );
              })}
            </section>

            {room.phase === "playing" && (
              <div className="sticky bottom-4 flex flex-wrap justify-center gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
                <button
                  type="button"
                  disabled={!canHit || pending}
                  onClick={hit}
                  className="min-w-[100px] rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Hit
                </button>
                <button
                  type="button"
                  disabled={!canStand || pending}
                  onClick={stand}
                  className="min-w-[100px] rounded-lg border-2 border-zinc-900 px-5 py-2.5 text-sm font-semibold dark:border-zinc-100"
                >
                  Stand
                </button>
                {!myTurn && me && !me.bust && !me.stood && (
                  <p className="w-full text-center text-sm text-zinc-500">Waiting for your turn…</p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
