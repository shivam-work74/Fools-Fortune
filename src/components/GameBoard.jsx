import React, { useEffect, useRef, useState } from "react";
import { createDeck, dealToPlayers, removePairsAndReturnRemoved, findPair } from "../utils/deck";
import Hand from "./Hand";
import Card from "./Card";
import PlayerAvatar from "./PlayerAvatar";
import WinnerModal from "./WinnerModal";
import HowToPlay from "./HowToPlay";
import { motion, AnimatePresence } from "framer-motion";

// --- Sub-components ---

function GameLog({ log }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 max-h-32 overflow-y-auto pointer-events-none text-center z-10 opacity-90 transition-opacity">
      <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl text-white text-sm shadow-xl space-y-1 border border-white/10">
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in perspective-1000">
      <div className="bg-gradient-to-br from-indigo-900 to-black rounded-3xl p-10 w-96 text-center shadow-[0_0_50px_rgba(99,102,241,0.5)] border border-white/10 relative transform rotate-x-12 hover:rotate-x-0 transition-transform duration-500">
        <div className="absolute inset-0 rounded-3xl opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
        <div className="relative z-10">
          <div className="text-7xl mb-6 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] animate-bounce">🏆</div>
          <h2 className="text-4xl font-black mb-2 text-white tracking-tight">VICTORY</h2>
          <p className="text-indigo-200 mb-8 font-light text-lg">
            <span className="font-bold text-white uppercase tracking-widest border-b border-indigo-500 pb-1">{name}</span> is safe.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-white text-indigo-900 px-8 py-4 rounded-xl shadow-xl hover:bg-gray-100 hover:scale-105 transition-all font-black text-lg tracking-widest uppercase"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function MovingCardAnimation({ movingCard }) {
  if (!movingCard || !movingCard.fromRect || !movingCard.toRect) return null;
  const { fromRect, toRect } = movingCard;

  // Calculate center points
  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;
  const endX = toRect.left + toRect.width / 2;
  const endY = toRect.top + toRect.height / 2;

  // We want to center the card on these points. A card is approx 96px width (w-24).
  // Adjust by half width/height (approx 48px, 72px)
  const cardOffsetX = 48;
  const cardOffsetY = 72;

  return (
    <motion.div
      key={movingCard.card.id} // Force remount for every new move
      initial={{
        x: startX - cardOffsetX,
        y: startY - cardOffsetY,
        scale: 0.5,
        opacity: 0,
        rotateY: 0
      }}
      animate={{
        x: endX - cardOffsetX,
        y: endY - cardOffsetY,
        scale: 1,
        opacity: 1,
        rotateY: 180, // Flip effect
        transition: { duration: 1.0, ease: "easeInOut" }
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none", perspective: "800px" }}
    >
      {/* Visual Representation of the moving card (Premium Back) */}
      <div className="w-24 h-36 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-xl border border-indigo-300 shadow-2xl transform-style-3d relative overflow-hidden">
        {/* Pattern Overlay */}
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

// --- Main Component ---

export default function GameBoard({ playersCount = 4, playerName = "You", playerAvatar = "😎", onExit }) {
  const [players, setPlayers] = useState([]);
  const [turn, setTurn] = useState(0);
  const [log, setLog] = useState([]);
  const [timer, setTimer] = useState(15);
  const [movingCard, setMovingCard] = useState(null);
  const [howOpen, setHowOpen] = useState(false);
  const [loser, setLoser] = useState(null);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const timerRef = useRef(null);
  const botTimeout = useRef(null);

  function pushLog(msg) {
    setLog(l => [...l, msg].slice(-5));
  }

  function initGame() {
    const deck = createDeck();
    const dealt = dealToPlayers(deck, playersCount);

    const initialPlayers = dealt.map((hand, idx) => {
      const isBot = idx !== 0;
      const name = idx === 0 ? playerName : `Bot ${idx}`;
      const { hand: cleaned, discards } = removePairsAndReturnRemoved(hand);
      return { id: idx, name, isBot, hand: cleaned, discards, finished: false };
    });

    setPlayers(initialPlayers);
    setTurn(0);
    setTimer(15);
    setLog(["🃏 Table Open!", "Good Luck."]);
    setLoser(null);
    setWinner(null);
    setGameStarted(true);

    checkPlayerFinished(initialPlayers);
  }

  // Initial setup
  useEffect(() => {
    initGame();
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(botTimeout.current);
    };
  }, [playersCount]);

  // Turn Timer
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!gameStarted || loser) return;

    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          handleTimeout();
          return 15;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [turn, loser, winner, gameStarted]);

  // Bot Action Trigger
  useEffect(() => {
    if (!gameStarted || !players[turn] || loser) return;
    if (players[turn].isBot && !players[turn].finished) {
      botTimeout.current = setTimeout(botAction, 1500);
    }
  }, [turn, players, loser, gameStarted]);


  function getNextActivePlayer(currentIdx) {
    let idx = currentIdx;
    let count = 0;
    while (count < players.length) {
      idx = (idx + 1) % players.length;
      if (players[idx] && !players[idx].finished) return idx;
      count++;
    }
    return null;
  }

  function advanceTurn() {
    if (loser) return;
    setTimer(15);
    const next = getNextActivePlayer(turn);
    if (next !== null) {
      setTurn(next);
    }
  }

  function handleTimeout() {
    if (players[turn].finished) {
      advanceTurn();
      return;
    }

    if (players[turn].isBot) {
      // Bot logic handles itself
    } else {
      const target = getNextActivePlayer(turn);
      pushLog(`⏱️ Time out! Auto-picking...`);
      if (target !== null && target !== turn) {
        executeDraw(target, null);
      }
    }
  }

  function botAction() {
    const target = getNextActivePlayer(turn);
    if (target !== null && target !== turn) {
      executeDraw(target, null);
    } else {
      advanceTurn();
    }
  }

  async function executeDraw(targetIndex, cardIndex = null) {
    if (loser) return;

    const currentPlayer = players[turn];
    const targetPlayer = players[targetIndex];

    if (!currentPlayer || !targetPlayer || targetPlayer.hand.length === 0) {
      advanceTurn();
      return;
    }

    const actualCardIndex = cardIndex !== null ? cardIndex : Math.floor(Math.random() * targetPlayer.hand.length);
    const drawnCard = targetPlayer.hand[actualCardIndex];
    if (!drawnCard) return;

    const fromId = `avatar-${targetIndex}`;
    const toId = `avatar-${turn}`;
    const fromEl = document.getElementById(fromId);
    const toEl = document.getElementById(toId);

    if (fromEl && toEl) {
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      setMovingCard({ card: drawnCard, fromRect, toRect });

      await new Promise(r => setTimeout(r, 1200));
      setMovingCard(null);
    } else {
      await new Promise(r => setTimeout(r, 500));
    }

    const newPlayers = [...players];

    // Remove from target
    newPlayers[targetIndex] = {
      ...targetPlayer,
      hand: targetPlayer.hand.filter(c => c.id !== drawnCard.id)
    };

    // Add/Check Pair for current
    const match = findPair(currentPlayer.hand, drawnCard);
    if (match) {
      pushLog(`✨ Match!`);
      newPlayers[turn] = {
        ...currentPlayer,
        hand: currentPlayer.hand.filter(c => c.id !== match.id),
        discards: [...currentPlayer.discards, match, drawnCard]
      };
    } else {
      pushLog(`📥 Drew a card`);
      newPlayers[turn] = {
        ...currentPlayer,
        hand: [...currentPlayer.hand, drawnCard]
      };
    }

    const checkedPlayers = checkPlayerFinished(newPlayers);
    setPlayers(checkedPlayers);

    if (!checkGameEnd(checkedPlayers)) {
      advanceTurn();
    }
  }

  function handleHumanCardClick(targetPlayerIndex, cardIndex) {
    if (turn !== 0) {
      pushLog("⚠️ Wait for your turn!");
      return;
    }

    const validTarget = getNextActivePlayer(0);
    if (targetPlayerIndex !== validTarget) {
      pushLog(`⚠️ Draw from ${players[validTarget].name} (Left)!`);
      return;
    }

    executeDraw(targetPlayerIndex, cardIndex);
  }

  function checkPlayerFinished(currentPlayers) {
    let someoneFinished = null;
    const updated = currentPlayers.map(p => {
      if (p.hand.length === 0 && !p.finished) {
        pushLog(`🎉 ${p.name} is SAFE!`);
        someoneFinished = p.name;
        return { ...p, finished: true };
      }
      return p;
    });

    if (someoneFinished) {
      setWinner(someoneFinished);
    }
    return updated;
  }

  function checkGameEnd(currentPlayers) {
    const active = currentPlayers.filter(p => !p.finished);
    if (active.length === 1) {
      const lastPlayer = active[0];
      setLoser(lastPlayer.name);
      pushLog(`💀 ${lastPlayer.name} is the Old Maid!`);
      return true;
    }
    return false;
  }

  // --- Layout Helpers ---

  function getPositionStyle(index, total) {
    // 3D Perspective Positioning
    // Human is always bottom center
    if (index === 0) return {
      bottom: "5%",
      left: "50%",
      transform: "translateX(-50%) translateZ(50px) scale(1)",
      zIndex: 50
    };

    if (total === 2) return { top: "10%", left: "50%", transform: "translateX(-50%) translateZ(-100px) scale(0.85)" };

    if (total >= 4) {
      if (index === 1) return { top: "35%", left: "1%", transform: "translateZ(0px) rotateY(25deg)" };
      if (index === 2) return { top: "2%", left: "50%", transform: "translateX(-50%) translateZ(-150px) scale(0.8)" };
      if (index === 3) return { top: "35%", right: "1%", transform: "translateZ(0px) rotateY(-25deg)" };
      if (index > 3) return { top: "20%", right: "1%" };
    }

    return { top: "20%", left: "50%" };
  }

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden select-none font-sans text-gray-100 flex items-center justify-center perspective-1000">

      {/* 3D Table Surface */}
      <div className="absolute w-[120%] h-[120%] bg-[#083015] transform rotate-x-20 origin-bottom shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] border-[20px] border-[#3e2723] rounded-[50%] top-[-10%] flex items-center justify-center overflow-hidden">
        {/* Felt Texture */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />

        {/* Center Logo/Mat */}
        {/* Center Logo/Mat - REMOVED for clarity
        <div className="w-[400px] h-[400px] rounded-full border-4 border-white/5 opacity-20 flex items-center justify-center transform rotate-x-60 scale-y-50">
          <span className="text-6xl grayscale opacity-50">♠</span>
        </div>
        */}
      </div>

      {/* Lighting / Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_90%)]" />

      {/* Top Bar (HUD) */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          {onExit && (
            <button onClick={onExit} className="px-4 py-2 bg-black/40 hover:bg-black/60 rounded-full text-gray-300 border border-white/10 backdrop-blur-md transition flex items-center gap-2">
              <span>←</span> <span className="text-xs uppercase font-bold tracking-widest">Exit</span>
            </button>
          )}
        </div>

        {/* Timer / Turn Info */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center">
          <div className="text-xs uppercase tracking-[0.3em] text-yellow-500/80 mb-1 font-bold">
            {players[turn]?.name}'s Turn
          </div>
          <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-yellow-500"
              initial={{ width: "100%" }}
              animate={{ width: `${(timer / 15) * 100}%` }}
              transition={{ ease: "linear", duration: 1 }}
            />
          </div>
        </div>

        <div className="flex gap-3 pointer-events-auto">
          <button onClick={() => setHowOpen(true)} className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md transition">Rules</button>
          <button onClick={initGame} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transition">Restart</button>
        </div>
      </div>

      {/* LOG (Subtle Notification) */}
      <GameLog log={log} />

      {/* PLAYERS LAYER */}
      <div className="absolute inset-0 pointer-events-none" style={{ perspective: "1000px" }}>
        <AnimatePresence>
          {players.map((p, idx) => {
            const style = getPositionStyle(idx, players.length);
            const isActive = turn === idx;
            const isTarget = turn === 0 && getNextActivePlayer(0) === idx;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute pointer-events-auto"
                style={style}
                id={`avatar-${idx}`}
              >
                {idx === 0 ? (
                  // HUMAN
                  <div className="flex flex-col items-center w-full max-w-4xl">
                    {/* Hand Container */}
                    <div className={`relative transition-all duration-500 ease-out ${isActive ? "translate-y-[-20px] scale-105" : "translate-y-0 scale-100"}`}>
                      <div className={`
                                   p-8 pb-4 rounded-[3rem] backdrop-blur-xl transition-all duration-500
                                   ${isActive ? "bg-black/40 ring-1 ring-yellow-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]" : "bg-black/20 ring-1 ring-white/5"}
                               `}>
                        <Hand
                          cards={p.hand}
                          hideCards={false}
                          onCardClick={() => { }}
                        />
                      </div>
                      {isActive && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-xl animate-bounce uppercase">
                          Your Action
                        </div>
                      )}
                    </div>

                    {/* Avatar (Situated "on" the table edge) */}
                    <div className="mt-6 transform translate-y-4">
                      <PlayerAvatar
                        name="YOU"
                        isBot={false}
                        cardCount={p.hand.length}
                        isActive={isActive}
                        finished={p.finished}
                        discards={p.discards}
                        avatar={playerAvatar}
                      />
                    </div>
                  </div>
                ) : (
                  // BOT
                  <div className="flex flex-col items-center gap-4 group">
                    <PlayerAvatar
                      name={p.name}
                      isBot={true}
                      cardCount={p.hand.length}
                      isActive={isActive}
                      finished={p.finished}
                      discards={p.discards}
                      isTarget={isTarget}
                    />

                    {/* Bot Hand (Face Down) */}
                    <div className={`
                               transition-all duration-500 transform-style-3d
                               ${isTarget ? "scale-110 z-30 filter drop-shadow-[0_0_20px_rgba(34,197,94,0.5)] -translate-y-2" : "scale-90 opacity-80 hover:opacity-100"}
                           `}>
                      {!p.finished && (
                        <Hand
                          cards={p.hand}
                          hideCards={true}
                          onCardClick={(cardIdx) => handleHumanCardClick(idx, cardIdx)}
                        />
                      )}
                    </div>
                    {isTarget && (
                      <div className="absolute -bottom-8 pointer-events-none text-green-400 text-[10px] font-bold uppercase tracking-widest animate-pulse bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-green-500/30">
                        Target System Locked
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Animation Layer (High Z-Index) */}
      <AnimatePresence>
        {movingCard && <MovingCardAnimation movingCard={movingCard} />}
      </AnimatePresence>

      {/* Overlays */}
      {howOpen && <HowToPlay onClose={() => setHowOpen(false)} />}
      {winner && <WinnerPopup name={winner} onBack={() => setWinner(null)} />}
      {loser && <WinnerModal loserName={loser} players={players} onRestart={initGame} />}

    </div>
  );
}
