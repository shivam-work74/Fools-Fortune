import React from "react";
import { motion } from "framer-motion";

export default function Card({ card, hidden = false, onClick, isSelected = false }) {
  if (hidden) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="card-back"
        onClick={onClick}
      >
        <div className="w-10 h-14 rounded-md bg-white/30" />
      </motion.div>
    );
  }

  if (!card) return <div className="card-face bg-gray-100" />;

  const isRed = card.suit === "♥" || card.suit === "♦" || card.isJoker;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.06, y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`card-face ${isSelected ? "ring-4 ring-indigo-200 bg-indigo-50 border-indigo-100" : "bg-white"} w-28 h-40 rounded-2xl flex flex-col items-center justify-center border shadow`}
    >
      {card.isJoker ? (
        <div className="text-3xl">🃏</div>
      ) : (
        <>
          <div className={`${isRed ? "text-red-600" : "text-gray-900"} text-xl font-bold`}>
            {card.rank}
          </div>
          <div className={`${isRed ? "text-red-600" : "text-gray-900"} text-xl`}>
            {card.suit}
          </div>
        </>
      )}
    </motion.div>
  );
}
