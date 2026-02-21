
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useVoice } from "../context/VoiceContext";
import Hand from "./Hand";
import Card from "./Card";
import PlayerAvatar from "./PlayerAvatar";
import WinnerModal from "./WinnerModal";
import HowToPlay from "./HowToPlay";
import { motion, AnimatePresence } from "framer-motion";
import { EmoteSelector, EmoteOverlay } from "./uno/EmoteSystem";

// --- Sub-components ---

function GameLog({ log }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 max-h-32 overflow-y-auto pointer-events-none text-center z-10 opacity-90 transition-opacity">
      <div className="bg-[var(--bg-glass)] backdrop-blur-md p-3 rounded-xl text-[var(--text-primary)] text-sm shadow-xl space-y-1 border border-[var(--border-glass)]">
        {log.slice(-3).map((msg, i) => (
          <div key={i} className="animate-fade-in text-shadow-sm font-medium">{msg}</div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function WinnerPopup({ name, onBack }) {
  return (
    <div className="fixed inset-0 bg-[var(--bg-glass)] backdrop-blur-xl flex items-center justify-center z-[100] animate-fade-in perspective-1000">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[40px] p-12 w-[500px] text-center shadow-[var(--shadow-premium)] relative transform rotate-x-12 hover:rotate-x-0 transition-transform duration-500 group overflow-hidden">
        <div className="absolute inset-0 rounded-3xl opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />

        <div className="relative z-10">
          <div className="text-8xl mb-8 drop-shadow-[0_0_30px_rgba(255,215,0,0.4)] animate-bounce">🏆</div>
          <h2 className="text-5xl font-black mb-4 text-gold tracking-tighter uppercase">VICTORY</h2>
          <p className="text-[var(--text-secondary)] mb-10 font-[serif] text-xl italic leading-relaxed">
            "Fortune favors the bold."<br />
            <span className="font-bold text-[var(--text-primary)] not-italic uppercase tracking-[0.2em] border-b border-yellow-600/50 pb-1 mt-2 inline-block">{name}</span> survives.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-[var(--accent)] text-white px-8 py-5 rounded-2xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all font-black text-xl tracking-[0.2em] uppercase border border-white/10"
          >
            Claim Winnings
          </button>
        </div>
      </div>
    </div>
  );
}

function MovingCardAnimation({ movingCard }) {
  if (!movingCard || !movingCard.fromRect || !movingCard.toRect) return null;
  const { fromRect, toRect } = movingCard;

  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;
  const endX = toRect.left + toRect.width / 2;
  const endY = toRect.top + toRect.height / 2;

  const cardOffsetX = 48;
  const cardOffsetY = 72;

  return (
    <motion.div
      key={Date.now()}
      initial={{ x: startX - cardOffsetX, y: startY - cardOffsetY, scale: 0.5, opacity: 0, rotateY: 0 }}
      animate={{ x: endX - cardOffsetX, y: endY - cardOffsetY, scale: 1, opacity: 1, rotateY: 180, transition: { duration: 1.0, ease: "easeInOut" } }}
      exit={{ opacity: 0, scale: 0.5 }}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none", perspective: "800px" }}
    >
      <div className="w-24 h-36 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-xl border border-indigo-300 shadow-2xl transform-style-3d relative overflow-hidden">
        <div className="absolute inset-2 border border-indigo-400/30 rounded-lg opacity-50" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-black"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl opacity-50 drop-shadow-lg">🛸</span>
        </div>
      </div>
    </motion.div>
  );
}

// --- Spectator Badge ---
function SpectatorBadge() {
  return (
    <div className="fixed top-24 right-8 bg-black/40 backdrop-blur-xl border border-red-500/30 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)] z-50 group">
      <div className="relative">
        <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_10px_red] animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-40" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 leading-none">Live Feed</span>
        <span className="text-[8px] font-bold uppercase tracking-widest text-white/30 mt-1">Satellite Uplink Active</span>
      </div>
    </div>
  );
}

// --- Main Component ---

// --- Soundscapes (Placeholder) ---
// Ideally this would be a separate hook/component managing Audio objects.
const SOUNDS = {
  SIP: new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.m4a'), // Placeholder
  CHECK: new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.m4a'), // Placeholder
};

// --- Main Component ---

export default function GameBoard() {
  const { lobbyId } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  const { isMuted, toggleMute, isSpeakerEnabled, toggleSpeaker } = useVoice();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState(null);
  const [log, setLog] = useState([]);
  const [timer, setTimer] = useState(15);
  const [movingCard, setMovingCard] = useState(null);
  const [howOpen, setHowOpen] = useState(false);
  const [winner, setWinner] = useState(null);
  const [loser, setLoser] = useState(null);
  const [signals, setSignals] = useState([]); // { id, from, type, x, y }

  const timerRef = useRef(null);

  const handleJoin = () => {
    if (!lobbyId || !socket) return;
    socket.emit("joinLobby", { lobbyId, username: user.username, avatar: "🛸" });
  };

  const handleSendEmote = (emote) => {
    if (!socket || !lobbyId) return;
    socket.emit('sendEmote', { lobbyId, emote });
  };

  // --- Socket Listeners ---
  useEffect(() => {
    if (!socket || !lobbyId) return;

    socket.on('gameStateUpdate', (newState) => {
      handleStateUpdate(newState);
    });

    socket.on('gameStarted', (initialState) => {
      handleStateUpdate(initialState);
    });

    socket.on('gameOver', ({ loser }) => {
      setLoser(loser.username);
      setLog(l => [...l, `💀 ${loser.username} is the Old Maid!`]);
    });

    socket.on('signalReceived', ({ from, type }) => {
      showSignal(from, type);
    });

    socket.on('spectatorUpdate', (newState) => {
      handleStateUpdate(newState);
    });

    socket.on('error', (err) => alert(err));

    return () => {
      socket.off('gameStateUpdate');
      socket.off('spectatorUpdate');
      socket.off('gameStarted');
      socket.off('gameOver');
      socket.off('signalReceived');
      socket.off('error');
    };
  }, [socket, lobbyId]);

  function handleStateUpdate(newState) {
    if (newState.lastAction) {
      const { from, to, match } = newState.lastAction;
      setLog(l => [...l, `${to} drew from ${from}`].slice(-5));
      if (match) setLog(l => [...l, `✨ ${to} made a match!`].slice(-5));
      animateDraw(from, to);
    }
    setGameState(newState);
    setTimer(15);

    const me = newState.players.find(p => p.username === user.username);
    if (me && me.finished && !winner) {
      setWinner(me.username);
    }
  }

  // --- Signals & Emotes ---
  const sendSignal = (type) => {
    socket.emit('sendSignal', { lobbyId, type });
    showSignal(user.username, type); // Show locally instantly
  };

  const showSignal = (username, type) => {
    // Determine position based on username
    if (!gameState) return;

    // Create signal object
    const id = Date.now() + Math.random();
    setSignals(prev => [...prev, { id, username, type }]);

    // Remove after 3 seconds
    setTimeout(() => {
      setSignals(prev => prev.filter(s => s.id !== id));
    }, 3000);

    // Play sound (mock)
    // if (SOUNDS[type]) SOUNDS[type].play().catch(() => {});
  };

  // --- Animation Helper ---
  async function animateDraw(fromName, toName) {
    if (!gameState) return;

    // Find a card from the 'from' player to animate
    const fromPlayer = gameState.players.find(p => p.username === fromName);
    if (!fromPlayer) return;

    // We'll target the last card in the 'from' player's hand for the visual
    // or just any card that exists in the DOM
    const fromSelector = fromName === user.username ? `[id^='card-']` : `[id^='target-card-']`;
    const fromElements = document.querySelectorAll(fromSelector);
    const fromEl = fromElements[fromElements.length - 1];
    const toEl = document.getElementById(`player-avatar-${toName}`);

    if (fromEl && toEl) {
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      setMovingCard({
        fromRect,
        toRect,
        id: Date.now()
      });

      // Clear the animation after it finishes
      setTimeout(() => {
        setMovingCard(null);
      }, 1000);
    }
  }

  // --- Interaction ---
  const handleCardClick = (targetPlayerIndex, cardIndex) => {
    if (!gameState || gameState.loser) return;
    const myIdx = gameState.players.findIndex(p => p.username === user.username);
    if (myIdx === -1) return;

    if (gameState.turnIndex !== myIdx) {
      setLog(l => [...l.slice(-4), "⚠️ Not your turn!"]);
      return;
    }

    socket.emit('playTurn', { lobbyId, targetPlayerIdx: targetPlayerIndex, cardIdx });
  };


  // --- Timer ---
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!gameState || loser) return;

    timerRef.current = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, loser]);

  // --- Render Helpers ---

  if (!gameState) return <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">Loading Mission Data...</div>;

  // If Spectating, myIndex might be -1.
  const myIndex = gameState.isSpectating ? 0 : gameState.players.findIndex(p => p.username === user.username);

  // If Spectating, just show players as is, maybe disable rotation or rotate around table? 
  // Simplified: If spectating, treat player 0 as "Me" (but random) or keep standard view.
  // Let's just rotate so index 0 is at bottom.
  const rotatedPlayers = gameState.isSpectating ? gameState.players : [
    ...gameState.players.slice(myIndex),
    ...gameState.players.slice(0, myIndex)
  ];

  function getPositionStyle(visualIndex, total) {
    if (visualIndex === 0) return { bottom: "5%", left: "50%", transform: "translateX(-50%) translateZ(50px) scale(1)", zIndex: 50 };
    if (total === 2) return { top: "10%", left: "50%", transform: "translateX(-50%) translateZ(-100px) scale(0.85)" };
    if (total >= 4) {
      if (visualIndex === 1) return { top: "35%", left: "1%", transform: "translateZ(0px) rotateY(25deg)" };
      if (visualIndex === 2) return { top: "2%", left: "50%", transform: "translateX(-50%) translateZ(-150px) scale(0.8)" };
      if (visualIndex === 3) return { top: "35%", right: "1%", transform: "translateZ(0px) rotateY(-25deg)" };
      if (visualIndex > 3) return { top: "20%", right: "1%" };
    }
    return { top: "20%", left: "50%" };
  }

  const isMyTurn = gameState.turnIndex === myIndex;

  const EMOTES = [
    { label: "🥃", type: "SIP", tooltip: "Sip Drink" },
    { label: "🎩", type: "TIP", tooltip: "Tip Hat" },
    { label: "⌚", type: "CHECK", tooltip: "Check Watch" },
    { label: "😰", type: "SWEAT", tooltip: "Nervous" }
  ];

  return (
    <div className="relative w-full h-screen bg-[var(--bg-primary)] overflow-hidden select-none font-sans text-[var(--text-primary)] flex items-center justify-center perspective-1000 transition-colors duration-500">

      {gameState.isSpectating && <SpectatorBadge />}

      {/* Emote floating layer — fixed, renders above everything */}
      <EmoteOverlay socket={socket} eventName="emoteReceived" />

      {/* 3D Table Surface - VIP Velvet Edition */}
      <div className="absolute w-[120%] h-[120%] bg-[#1a0520] transform rotate-x-20 origin-bottom shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] border-[25px] border-[#2a1a0a] rounded-[50%] top-[-10%] flex items-center justify-center overflow-hidden ring-1 ring-yellow-900/50">
        <div className="absolute inset-0 opacity-60 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.2)_0%,rgba(0,0,0,0.8)_80%)]" />
        <div className="absolute w-[85%] h-[85%] rounded-[50%] border-2 border-yellow-600/20 opacity-50 pointer-events-none" />
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_90%)]" />

      {/* Top Bar - VIP Style */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button onClick={() => navigate('/dashboard')} className="px-5 py-2 bg-[var(--bg-glass)] hover:bg-red-950/20 rounded-lg text-[var(--text-muted)] hover:text-red-500 border border-[var(--border-glass)] hover:border-red-500/30 backdrop-blur-md transition-all flex items-center gap-2 group shadow-sm">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> <span className="text-xs uppercase font-serif font-bold tracking-[0.2em]">Fold & Leave</span>
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-6 flex flex-col items-center">
          <div className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-yellow-600/80 mb-2 font-serif font-bold">
            {gameState.players[gameState.turnIndex]?.username === user.username ? "It is your turn" : `${gameState.players[gameState.turnIndex]?.username}'s Turn`}
          </div>
          <div className="w-32 h-0.5 bg-[var(--border-primary)] rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${gameState.players[gameState.turnIndex]?.username === user.username ? "bg-yellow-500 box-shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "bg-gray-600"}`}
              initial={{ width: "100%" }}
              animate={{ width: `${(timer / 15) * 100}%` }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>
        </div>

        <div className="flex gap-3 pointer-events-auto">
          <button onClick={() => setHowOpen(true)} className="w-10 h-10 flex items-center justify-center bg-[var(--bg-glass)] hover:bg-yellow-600/20 border border-[var(--border-glass)] hover:border-yellow-600/50 rounded-full text-yellow-600/80 transition-all font-serif italic font-bold shadow-sm">?</button>
        </div>
      </div>

      {/* THE SIGNAL (Emote Bar) */}
      <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-2 pointer-events-auto">
        {EMOTES.map(emote => (
          <button
            key={emote.type}
            onClick={() => sendSignal(emote.type)}
            className="w-12 h-12 bg-black/60 hover:bg-yellow-600/20 border border-white/10 hover:border-yellow-600/50 rounded-full flex items-center justify-center text-xl transition-all shadow-lg hover:scale-110 active:scale-95 group relative"
          >
            {emote.label}
            <span className="absolute right-full mr-3 text-xs uppercase tracking-widest bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-yellow-500/80 pointer-events-none">
              {emote.tooltip}
            </span>
          </button>
        ))}

        {/* Voice Control */}
        <button
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all shadow-lg hover:scale-110 active:scale-95 group relative border ${isMuted ? 'bg-red-600/40 border-red-500/50 text-white' : 'bg-green-600/40 border-green-500/50 text-white'}`}
        >
          {isMuted ? '🔇' : '🎙️'}
          <span className="absolute right-full mr-3 text-xs uppercase tracking-widest bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-yellow-500/80 pointer-events-none">
            {isMuted ? 'Unmute' : 'Mute'}
          </span>
        </button>

        <EmoteSelector onSelect={handleSendEmote} />

        {/* Speaker Control */}
        <button
          onClick={toggleSpeaker}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all shadow-lg hover:scale-110 active:scale-95 group relative border ${!isSpeakerEnabled ? 'bg-red-600/40 border-red-500/50 text-white' : 'bg-blue-600/40 border-blue-500/50 text-white'}`}
        >
          {isSpeakerEnabled ? '🔊' : '🔇'}
          <span className="absolute right-full mr-3 text-xs uppercase tracking-widest bg-black/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-yellow-500/80 pointer-events-none">
            {isSpeakerEnabled ? 'Disable Speaker' : 'Enable Speaker'}
          </span>
        </button>
      </div>

      <GameLog log={log} />

      {/* PLAYERS LAYER */}
      <div className="absolute inset-0 pointer-events-none" style={{ perspective: "1000px" }}>
        <AnimatePresence>
          {rotatedPlayers.map((p, visualIdx) => {
            const originalIdx = gameState.players.findIndex(gp => gp.username === p.username);
            const style = getPositionStyle(visualIdx, gameState.players.length);
            const isActive = gameState.turnIndex === originalIdx;
            const isTarget = isMyTurn && visualIdx !== 0 && !p.finished;

            // Check for active signals
            const activeSignal = signals.find(s => s.username === p.username);

            return (
              <motion.div
                key={p.username}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute pointer-events-auto"
                style={style}
              >
                {/* Signal Bubble — renders BELOW avatar for top-row opponents, ABOVE for bottom player */}
                <AnimatePresence>
                  {activeSignal && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 0 }}
                      animate={{ opacity: 1, scale: 1, y: visualIdx === 0 ? -70 : 50 }}
                      exit={{ opacity: 0, scale: 0.5, y: visualIdx === 0 ? -90 : 70 }}
                      className={`absolute ${visualIdx === 0 ? '-top-14' : 'top-full mt-2'} left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-4xl px-4 py-2 rounded-2xl shadow-2xl z-50 border border-white/20 whitespace-nowrap`}
                    >
                      {EMOTES.find(e => e.type === activeSignal.type)?.label}
                    </motion.div>
                  )}
                </AnimatePresence>

                {visualIdx === 0 ? (
                  // ME (or Bottom Player if Spectating)
                  <div className="flex flex-col items-center w-full max-w-4xl">
                    <div className={`relative transition-all duration-500 ease-out ${isActive ? "translate-y-[-20px] scale-105" : "translate-y-0 scale-100"}`}>

                      {/* Only show Hand if NOT spectating */}
                      {!gameState.isSpectating && (
                        <div className={`
                                   p-8 pb-4 rounded-[3rem] backdrop-blur-xl transition-all duration-500
                                   ${isActive ? "bg-black/40 ring-1 ring-yellow-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]" : "bg-black/20 ring-1 ring-white/5"}
                               `}>
                          <Hand
                            cards={gameState.myHand || []}
                            hideCards={false}
                            onCardClick={() => { }}
                          />
                        </div>
                      )}

                      {isActive && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-xl animate-bounce uppercase">
                          Your Action
                        </div>
                      )}
                    </div>

                    <div className="mt-6 transform translate-y-4">
                      <PlayerAvatar
                        name={p.username}
                        isBot={false}
                        cardCount={gameState.myHand?.length || 0}
                        isActive={isActive}
                        finished={p.finished}
                        discards={p.discards}
                        avatar={p.avatar}
                        peerId={p.peerId}
                      />
                    </div>
                  </div>
                ) : (
                  // OPPONENTS
                  <div className="flex flex-col items-center gap-4 group">
                    <PlayerAvatar
                      name={p.username}
                      isBot={false}
                      cardCount={p.handCount}
                      isActive={isActive}
                      finished={p.finished}
                      discards={p.discards}
                      isTarget={isTarget}
                      avatar={p.avatar}
                      peerId={p.peerId}
                    />

                    <div className={`
                               transition-all duration-500 transform-style-3d
                               ${isTarget ? "scale-110 z-30 filter drop-shadow-[0_0_20px_rgba(34,197,94,0.5)] -translate-y-2 cursor-pointer" : "scale-90 opacity-80"}
                           `}>
                      {!p.finished && (
                        <Hand
                          cards={Array(p.handCount).fill({ id: 'uk', rank: '?', suit: '?' })}
                          hideCards={true}
                          onCardClick={(cardIdx) => isTarget && handleCardClick(originalIdx, cardIdx)}
                        />
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {movingCard && <MovingCardAnimation movingCard={movingCard} />}
      </AnimatePresence>

      {howOpen && <HowToPlay onClose={() => setHowOpen(false)} />}
      {winner && <WinnerPopup name={winner} onBack={() => setWinner(null)} />}
      {loser && <WinnerModal loserName={loser} players={gameState?.players} onRestart={() => navigate('/dashboard')} />}

    </div >
  );
}
