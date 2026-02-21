import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WinnerModal({ loserName, players = [], onRestart }) {
  const winnerNames = players.filter(p => p.name !== loserName).map(p => p.name).join(", ");
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[var(--bg-glass)] backdrop-blur-xl flex items-center justify-center z-[200]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[40px] p-12 w-full max-w-md text-center shadow-[var(--shadow-premium)] relative overflow-hidden"
        >
          {/* Decorative accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <h2 className="text-4xl font-black mb-6 text-[var(--text-primary)] tracking-tighter uppercase">GAME OVER</h2>

          <div className="space-y-4 mb-10">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-sm text-red-500 font-bold uppercase tracking-widest mb-1">Cursed Soul</p>
              <p className="text-2xl font-black text-[var(--text-primary)]">💀 {loserName}</p>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <p className="text-sm text-green-500 font-bold uppercase tracking-widest mb-1">Found Fortune</p>
              <p className="text-xl font-black text-[var(--text-primary)]">🎉 {winnerNames || "The Table"}</p>
            </div>
          </div>

          <button
            onClick={onRestart}
            className="w-full bg-[var(--accent)] text-white px-8 py-5 rounded-[20px] font-black uppercase tracking-[0.2em] shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Restart Game
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
