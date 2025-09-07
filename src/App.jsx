import React, { useState } from "react";
import GameBoard from "./components/GameBoard";
import HowToPlay from "./components/HowToPlay";

export default function App() {
  const [screen, setScreen] = useState("menu"); // Default directly → menu
  const [playersCount, setPlayersCount] = useState(2);
  const [botCount, setBotCount] = useState(1);
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

  if (screen === "menu")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 relative overflow-hidden">
        {/* Floating gradient orbs */}
        <div className="absolute w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob top-10 left-10"></div>
        <div className="absolute w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 top-40 right-10"></div>
        <div className="absolute w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 bottom-10 left-1/3"></div>

        <div className="relative bg-white/20 backdrop-blur-xl p-10 rounded-3xl shadow-2xl text-center  border border-white/30 animate-fade-in">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-6">
            🎴 Fools-Fortune
          </h1>
          <p className="text-gray-100 mb-8 text-lg tracking-wide">
            Choose your mode and test your luck ✨
          </p>

          <div className="flex flex-col gap-5">
            <button
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg transition transform hover:scale-105 hover:shadow-pink-500/40"
              onClick={startTwoPlayer}
            >
              🤖 2 Player Mode (You + 1 Bot)
            </button>

            <button
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition transform hover:scale-105 hover:shadow-purple-500/40"
              onClick={startFourPlayer}
            >
              🤖 4 Player Mode (You + 3 Bots)
            </button>

            <button
              className="px-6 py-3 bg-white/30 hover:bg-white/40 rounded-xl font-semibold text-white backdrop-blur-md transition transform hover:scale-105 hover:shadow-md"
              onClick={() => setShowHow(true)}
            >
              📖 How to Play
            </button>
          </div>
        </div>

        {showHow && <HowToPlay onClose={() => setShowHow(false)} />}
      </div>
    );
    return (
  <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
    <div className="w-full  bg-white shadow-2xl overflow-hidden">
      <GameBoard playersCount={playersCount} botCount={botCount} />
    </div>
  </div>
)


}
