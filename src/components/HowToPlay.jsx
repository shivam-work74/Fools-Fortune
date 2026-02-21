import React from "react";

export default function HowToPlay({ onClose }) {
  return (
    <div className="fixed inset-0 bg-[var(--bg-glass)] backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[40px] p-10 w-full max-w-lg text-center shadow-[var(--shadow-premium)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-[0.03] rounded-3xl pointer-events-none" />

        <h2 className="text-4xl font-black mb-8 text-gold tracking-tighter uppercase border-b border-[var(--border-primary)] pb-6">House Rules</h2>

        <div className="text-left space-y-6 mb-10 font-sans text-[var(--text-secondary)]">
          <p className="text-xs italic text-yellow-600 font-bold uppercase tracking-widest text-center mb-6">
            "Trust no one. Keep your face blank and your hand hidden."
          </p>
          <ul className="space-y-4 list-none px-4">
            <li className="flex gap-4 items-start">
              <span className="text-yellow-600 font-black">01</span>
              <span className="text-sm leading-relaxed">The dealer distributes all cards. Remove any pairs immediately to clear your hand.</span>
            </li>
            <li className="flex gap-4 items-start">
              <span className="text-yellow-600 font-black">02</span>
              <span className="text-sm leading-relaxed">On your turn, draw one card from the player to your right (or left, depending on cards).</span>
            </li>
            <li className="flex gap-4 items-start">
              <span className="text-yellow-600 font-black">03</span>
              <span className="text-sm leading-relaxed">If you form a pair, discard it into the pile.</span>
            </li>
            <li className="flex gap-4 items-start">
              <span className="text-yellow-600 font-black">04</span>
              <span className="text-sm leading-relaxed">The protocol ends when one soul is left holding the <strong>Cursed Joker</strong>.</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-[var(--bg-glass)] hover:bg-yellow-600/10 border border-yellow-600/50 rounded-[20px] text-yellow-600 font-black uppercase tracking-[0.2em] text-xs transition-all hover:scale-[1.02] shadow-sm"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
