import React from "react";

export default function WinnerModal({ loserName, players=[], onRestart }) {
  const winnerNames = players.filter(p=>p.name!==loserName).map(p=>p.name).join(", ");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-96 text-center shadow-xl relative">
        <h2 className="text-2xl font-bold mb-4">🏁 Game Over!</h2>
        <p className="text-lg mb-2">💀 <span className="font-semibold">{loserName}</span> got the Joker!</p>
        <p className="text-lg mb-6">🎉 Winner{winnerNames.includes(",")?"s":""}: <span className="font-semibold">{winnerNames}</span></p>
        <button onClick={onRestart} className="bg-indigo-600 text-white px-6 py-2   rounded-full shadow hover:bg-indigo-700 transition">
          Restart Game
        </button>
      </div>
    </div>
  )
}
