import React, { useState } from "react";
import GameBoard from "./components/GameBoard";
import HowToPlay from "./components/HowToPlay";

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [playersCount, setPlayersCount] = useState(2);
  const [botCount, setBotCount] = useState(1); // Default to 1 bot
  const [showHow, setShowHow] = useState(false);

  function startTwoPlayer() {
    setPlayersCount(2);
    setBotCount(1);
    setScreen("game");
  }
  function startFourPlayer() {
    setPlayersCount(4);
    setBotCount(3);
    setScreen("game");
  }

  if (screen === "menu") return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">🎴 Old Maid</h1>
        <p className="text-gray-600 mb-6">Choose your mode</p>
        <div className="flex flex-col gap-4">
          <button className="px-5 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-semibold transition" onClick={startTwoPlayer}>
            🤖 2 Player Mode (You + 1 Bot)
          </button>
          <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition" onClick={startFourPlayer}>
            🤖 4 Player Mode (You + 3 Bots)
          </button>
          <button className="px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition" onClick={() => setShowHow(true)}>
            📖 How to Play
          </button>
        </div>
      </div>
      {showHow && <HowToPlay onClose={() => setShowHow(false)} />}
    </div>
  );

  return <div className="min-h-screen bg-gray-100 p-6"><GameBoard playersCount={playersCount} botCount={botCount} /></div>;
}