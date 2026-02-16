import React from "react";

export default function HowToPlay({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-96 text-center shadow-xl relative">
        <h2 className="text-xl font-bold mb-4">📖 How to Play</h2>
        <p className="text-sm text-gray-700 mb-2">
          Old Maid is a card game where players try to form pairs and avoid keeping the Joker.
        </p>
        <p className="text-sm text-gray-700 mb-2">Rules:</p>
        <ul className="text-left text-sm text-gray-600 mb-4 list-disc list-inside">
          <li>Each player starts with cards dealt randomly.</li>
          <li>Remove pairs from your hand immediately.</li>
          <li>On your turn, draw a card from the next player.</li>
          <li>If a pair is formed, it is discarded automatically.</li>
          <li>The player left holding the Joker loses.</li>
        </ul>
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow hover:bg-indigo-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
