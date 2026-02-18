import React from "react";

export default function HowToPlay({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 w-[500px] text-center shadow-[0_0_50px_rgba(202,138,4,0.2)] border border-yellow-600/30 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-20 rounded-3xl pointer-events-none" />

        <h2 className="text-3xl font-bold mb-6 text-gold font-serif tracking-wide border-b border-white/10 pb-4">House Rules</h2>

        <div className="text-left space-y-4 mb-8 font-sans text-amber-50/80">
          <p className="text-sm italic text-yellow-500/60 text-center mb-4">
            "Trust no one. Keep your face blank and your hand hidden."
          </p>
          <ul className="space-y-3 list-none">
            <li className="flex gap-3 items-start">
              <span className="text-yellow-500">1.</span>
              <span>The dealer distributes all cards. Remove any pairs immediately to clear your hand.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-yellow-500">2.</span>
              <span>On your turn, draw one card from the player to your right (or left, depending on the house dealer).</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-yellow-500">3.</span>
              <span>If you form a pair, discard it.</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-yellow-500">4.</span>
              <span>The protocol ends when one poor soul is left holding the <strong>Joker (Old Maid)</strong>.</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="px-8 py-3 bg-white/5 hover:bg-yellow-600/20 border border-yellow-600/50 rounded-full text-yellow-500 font-bold uppercase tracking-widest transition-all hover:scale-105"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
