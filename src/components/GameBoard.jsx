import React, { useEffect, useRef, useState } from "react";
import { createDeck, dealToPlayers, removePairsAndReturnRemoved } from "../utils/deck";
import Hand from "./Hand";
import WinnerModal from "./WinnerModal";
import HowToPlay from "./HowToPlay";
import { motion, AnimatePresence } from "framer-motion";

// Helper for showing log messages with fade-in
function GameLog({ log }) {
  return (
    <div className="bg-white rounded-xl shadow p-3 mb-4 max-h-40 overflow-y-auto fade-in">
      {log.map((msg, i) => (
        <div key={i} className="text-sm text-gray-700 mb-1">{msg}</div>
      ))}
    </div>
  );
}

// Discard pile visual
function DiscardPile({ pile }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="font-semibold text-gray-600 mr-2">Discard Pile:</div>
      {pile.slice(0, 12).map((card, i) => (
        <motion.div
          key={card.id + i}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          className="card-face w-10 h-14 text-xs"
        >
          {card.isJoker ? "🃏" : `${card.rank}${card.suit}`}
        </motion.div>
      ))}
      {pile.length > 12 && <span className="text-xs text-gray-400 ml-2">+{pile.length - 12} more</span>}
    </div>
  );
}

// Winner popup for players who finish
function WinnerPopup({ name, onBack }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-96 text-center shadow-xl relative">
        <h2 className="text-2xl font-bold mb-4">🎉 Winner!</h2>
        <p className="text-lg mb-2"><span className="font-semibold">{name}</span> has finished all cards and won!</p>
        <button
          onClick={onBack}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow hover:bg-indigo-700 transition mt-3"
        >
          Back
        </button>
      </div>
    </div>
  );
}

// Tutorial overlay
function TutorialOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-[350px] text-center shadow-xl relative">
        <h2 className="text-xl font-bold mb-4">📝 How to Play Old Maid</h2>
        <ol className="text-left text-sm text-gray-700 mb-4 list-decimal list-inside">
          <li>All players are dealt cards. Pairs are removed automatically.</li>
          <li>On your turn, <span className="font-semibold text-indigo-700">click a stack above</span> to draw a card from the next player.</li>
          <li>If you form a pair, it is discarded automatically.</li>
          <li>Players who finish all cards are marked as winners.</li>
          <li>The last player left with the Joker loses.</li>
        </ol>
        <p className="text-xs text-gray-500 mb-3">Tip: Watch the log and banners for what's happening!</p>
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow hover:bg-indigo-700 transition"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

export default function GameBoard({ playersCount = 2 }) {
  const [players, setPlayers] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [turn, setTurn] = useState(0);
  const [log, setLog] = useState([]);
  const [timer, setTimer] = useState(10);
  const [movingCard, setMovingCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [howOpen, setHowOpen] = useState(false);
  const [loser, setLoser] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const timerRef = useRef(null);
  const botTimeout = useRef(null);

  function pushLog(msg) {
    setLog(l => [msg, ...l].slice(0, 80));
  }

  function startNewGame() {
    const deck = createDeck();
    const dealt = dealToPlayers(deck, playersCount);

    const tmpPlayers = dealt.map((hand, idx) => {
      const isBot = idx !== 0;
      const name = idx === 0 ? "You" : `Bot ${idx}`;
      const { hand: cleaned, discards } = removePairsAndReturnRemoved(hand);
      return { id: idx, name, isBot, hand: cleaned, discards, finished: false };
    });

    const allDiscards = tmpPlayers.flatMap(p => p.discards || []);
    setPlayers(tmpPlayers.map(({ id, name, isBot, hand, finished }) => ({ id, name, isBot, hand, finished })));
    setDiscardPile(allDiscards);
    setTurn(0);
    setTimer(10);
    setLog(["Game started — initial pairs removed."]);
    setSelectedCard(null);
    setLoser(null);
    setWinner(null);
    setShowTutorial(true);
  }

  useEffect(() => {
    startNewGame();
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(botTimeout.current);
    };
  }, [playersCount]);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (loser || winner) return;

    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          handleTimeout();
          return 10;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [turn, players, loser, winner]);

  function nextActivePlayer(from) {
    let idx = from;
    for (let i = 0; i < players.length; i++) {
      idx = (idx + 1) % players.length;
      if (players[idx].hand.length > 0 && !players[idx].finished) return idx;
    }
    return null;
  }

  function handleTimeout() {
    const who = players[turn]?.name || `Player ${turn + 1}`;
    pushLog(`⏱️ ${who} timed out — skipping.`);
    const next = nextActivePlayer(turn);
    if (next !== null) {
      setTurn(next);
      setTimer(10);
    }
  }

  function checkPlayerFinished(playersArr) {
    let finishedSomeone = false;
    let finishedName = null;
    const updated = playersArr.map(p => {
      if (p.hand.length === 0 && !p.finished) {
        finishedSomeone = true;
        finishedName = p.name;
        pushLog(`🏆 ${p.name} finished all cards and won!`);
        return { ...p, finished: true };
      }
      return p;
    });
    if (finishedSomeone) setWinner(finishedName);
    return updated;
  }

  function checkGameEnd(playersArr) {
    const activePlayers = playersArr.filter(p => !p.finished && p.hand.length > 0);
    if (activePlayers.length === 1 && activePlayers[0].hand.length === 1 && activePlayers[0].hand[0].isJoker) {
      setLoser(activePlayers[0].name);
      pushLog(`💀 ${activePlayers[0].name} got the Joker!`);
      return true;
    }
    return false;
  }

  function isSpectator() {
    return players[0]?.finished;
  }

  function drawFrom(targetIndex, cardIndex = null) {
    if (!players[targetIndex] || !players[turn]) return;
    if (players[turn].hand.length === 0 || players[turn].finished) return;
    if (players[targetIndex].hand.length === 0 || players[targetIndex].finished) {
      pushLog(`${players[targetIndex].name} has no cards.`);
      const next = nextActivePlayer(turn);
      if (next !== null) {
        setTurn(next);
        setTimer(10);
      }
      return;
    }

    const idx = cardIndex !== null ? cardIndex : Math.floor(Math.random() * players[targetIndex].hand.length);
    const drawn = players[targetIndex].hand[idx];

    const fromElem = document.getElementById(`hand-${targetIndex}`);
    const toElem = document.getElementById(`hand-${turn}`);
    const fromRect = fromElem?.getBoundingClientRect();
    const toRect = toElem?.getBoundingClientRect();

    setMovingCard({ card: drawn, from: targetIndex, to: turn, fromRect, toRect });

    setTimeout(() => {
      setPlayers(prev => {
        const next = prev.map(p => ({ ...p, hand: [...p.hand], finished: p.finished }));
        next[targetIndex].hand = next[targetIndex].hand.filter(c => c.id !== drawn.id);
        next[turn].hand = [...next[turn].hand, drawn];

        const { hand: cleaned, discards } = removePairsAndReturnRemoved(next[turn].hand);
        next[turn].hand = cleaned;
        setDiscardPile(d => [...discards, ...d]);
        pushLog(`🎴 ${next[turn].name} drew a card from ${players[targetIndex].name}`);
        if (discards.length > 0) pushLog(`🗑️ ${next[turn].name} discarded a pair!`);

        setMovingCard(null);
        setSelectedCard(null);

        const checked = checkPlayerFinished(next);
        if (!checkGameEnd(checked)) {
          setTimeout(() => {
            const nextPlayer = nextActivePlayer(turn);
            if (nextPlayer !== null) {
              setTurn(nextPlayer);
              setTimer(10);
            }
          }, 900);
        }
        return checked;
      });
    }, 1400);
  }

  function humanDrawClick(targetIndex, cardIndex = null) {
    if (loser || winner) return;
    if (players[turn]?.isBot) {
      pushLog("Wait — it's a bot's turn.");
      return;
    }
    drawFrom(targetIndex, cardIndex);
    setTimer(10);
  }

  function botAction() {
    if (loser || winner) return;

    const botIdx = turn;
    let target = nextActivePlayer(botIdx);
    if (target === null || target === botIdx) {
      const next = nextActivePlayer(botIdx);
      if (next !== null) {
        setTurn(next);
        setTimer(10);
      }
      return;
    }

    pushLog(`🤖 ${players[botIdx].name} is drawing a card from ${players[target].name}...`);
    botTimeout.current = setTimeout(() => {
      drawFrom(target);
      setTimer(10);
    }, 1400);
  }

  useEffect(() => {
    if (loser || winner) return;
    if (players[turn]?.isBot) botAction();
  }, [turn, players, loser, winner]);

  function restart() {
    startNewGame();
  }

  function currentTurnLabel() {
    const p = players[turn];
    if (!p) return "";
    if (p.finished) return `${p.name} has finished!`;
    if (p.isBot) return `🤖 ${p.name}'s turn (Bot)`;
    if (p.id === 0) return "Your turn — click a stack above to draw!";
    return `${p.name}'s turn`;
  }

  function TimerBar() {
    return (
      <div className="timer-bar mt-2 mb-2">
        <div className="timer-fill" style={{ width: `${(timer / 10) * 100}%` }} />
      </div>
    );
  }

  function MovingCardAnimation({ movingCard }) {
    if (!movingCard || !movingCard.fromRect || !movingCard.toRect) return null;
    const { card, fromRect, toRect } = movingCard;
    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;

    return (
      <motion.div
        initial={{ x: startX, y: startY, scale: 0.8, opacity: 0.8 }}
        animate={{ x: endX, y: endY, scale: 1, opacity: 1, transition: { duration: 1.2, ease: "easeInOut" } }}
        exit={{ opacity: 0, scale: 0.8 }}
        style={{ position: "fixed", zIndex: 1000, pointerEvents: "none" }}
      >
        <div className="w-28 h-40 bg-white rounded-2xl shadow flex items-center justify-center border">
          <div className="text-2xl font-semibold">{movingCard.card.isJoker ? "🃏" : `${movingCard.card.rank}${movingCard.card.suit}`}</div>
        </div>
      </motion.div>
    );
  }

  function TurnBanner() {
    if (loser || winner) return null;
    if (isSpectator()) {
      return (
        <div className="absolute top-0 left-0 w-full text-center py-2 bg-yellow-100 text-yellow-800 font-bold rounded-t-2xl z-10">
          You finished! Bots are playing out the rest.
        </div>
      );
    }
    if (players[turn]?.isBot) {
      return (
        <div className="absolute top-0 left-0 w-full text-center py-2 bg-indigo-100 text-indigo-700 font-bold rounded-t-2xl z-10">
          Bot's turn: {players[turn].name}
        </div>
      );
    }
    if (players[turn]?.id === 0) {
      return (
        <div className="absolute top-0 left-0 w-full text-center py-2 bg-green-100 text-green-700 font-bold rounded-t-2xl z-10">
          Your turn! Click a stack above to draw.
        </div>
      );
    }
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 grid gap-6 relative">
        <TurnBanner />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Old Maid</h1>
            <div className="text-sm text-gray-600 mt-1">{loser ? "Game over" : currentTurnLabel()}</div>
            <TimerBar />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setHowOpen(true)} className="btn bg-white border px-3 rounded">How to play</button>
            <button onClick={restart} className="btn bg-indigo-600 text-white">Restart</button>
          </div>
        </div>

        <GameLog log={log} />
        <DiscardPile pile={discardPile} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {players.map((p, idx) => {
            if (idx === 0) return null; // skip human hand here
            if (p.finished) {
              return (
                <div key={p.id} id={`hand-${idx}`} className="p-4 rounded-xl bg-green-50 ring-2 ring-green-200">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-green-600">Finished!</div>
                </div>
              );
            }
            const highlight = turn === 0 && nextActivePlayer(0) === idx;
            return (
              <div
                key={p.id}
                id={`hand-${idx}`}
                className={`p-4 rounded-xl ${turn === idx ? "bg-indigo-50 ring-2 ring-indigo-200" : "bg-white"} ${highlight ? "ring-4 ring-green-400" : ""}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.hand.length} cards</div>
                </div>
                <div className="flex justify-center">
                  <Hand
                    cards={p.hand}
                    hideCards={true} // always hide bot cards
                    selectedCardId={selectedCard?.id || null}
                    onStackClick={() => humanDrawClick(idx)}
                  />
                </div>
                {turn === idx && <div className="text-xs text-indigo-600 mt-2 text-center">It's their turn</div>}
                {highlight && <div className="text-xs text-green-600 mt-2 text-center font-bold">Click here to draw!</div>}
              </div>
            )
          })}
        </div>

        <div className={`flex flex-col items-center gap-3 mt-6 ${players[0]?.finished ? "bg-green-50 ring-2 ring-green-200 rounded-xl p-4" : ""}`} id="hand-0">
          <div className="text-sm text-gray-700">You</div>
          <Hand
            cards={players[0]?.hand || []}
            hideCards={false} // human sees cards
            onCardClick={(cardIdx) => setSelectedCard(players[0]?.hand[cardIdx])}
            selectedCardId={selectedCard?.id || null}
          />
          <div className="text-xs text-gray-500">{players[0]?.hand?.length || 0} cards</div>
          {players[0]?.finished && <div className="text-green-600 font-semibold mt-2">You finished! 🎉</div>}
        </div>

        <AnimatePresence>
          {movingCard && <MovingCardAnimation movingCard={movingCard} />}
        </AnimatePresence>
      </div>

      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
      {howOpen && <HowToPlay onClose={() => setHowOpen(false)} />}
      {winner && <WinnerPopup name={winner} onBack={() => setWinner(null)} />}
      {loser && <WinnerModal loserName={loser} players={players} onRestart={restart} />}
    </div>
  );
}      
