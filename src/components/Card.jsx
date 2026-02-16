import React from "react";
import { motion } from "framer-motion";

export default function Card({ card, hidden, onClick, selected }) {
  // Common styles
  const cardBase = "w-24 h-36 rounded-xl shadow-lg border relative overflow-hidden select-none transition-transform duration-300 transform-style-3d";
  const hoverEffect = "hover:scale-105 hover:shadow-2xl hover:-translate-y-2";

  // Card Back Design (Premium Pattern)
  if (hidden) {
    return (
      <div
        className={`${cardBase} bg-gradient-to-br from-indigo-700 to-indigo-900 border-indigo-300 ${hoverEffect} cursor-pointer group`}
        onClick={onClick}
      >
        {/* Pattern Overlay */}
        <div className="absolute inset-2 border border-indigo-400/30 rounded-lg opacity-50" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-black"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)" }}
        />

        {/* Center Logo/Emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-2 border-indigo-300/50 flex items-center justify-center bg-indigo-800/80 backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform">
            <span className="text-indigo-200 font-serif font-bold text-xl drop-shadow-md">🗝️</span>
          </div>
        </div>
      </div>
    );
  }

  // Card Front (Paper Texture)
  const isRed = card.suit === "♥" || card.suit === "♦";

  return (
    <motion.div
      layoutId={`card-${card.id}`}
      className={`
        ${cardBase} bg-white border-gray-300
        flex flex-col justify-between p-2 
        ${selected ? "ring-4 ring-yellow-400 -translate-y-4 shadow-2xl z-20" : hoverEffect}
      `}
      onClick={onClick}
    >
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

      {/* Top Left */}
      <div className={`text-lg font-bold leading-none ${isRed ? "text-red-600" : "text-gray-900"}`}>
        <div>{card.rank}</div>
        <div>{card.suit}</div>
      </div>

      {/* Center Big Suit */}
      <div className={`absolute inset-0 flex items-center justify-center text-5xl opacity-10 font-serif ${isRed ? "text-red-600" : "text-gray-900"}`}>
        {card.suit}
      </div>

      {/* Bottom Right (Rotated) */}
      <div className={`text-lg font-bold leading-none self-end transform rotate-180 ${isRed ? "text-red-600" : "text-gray-900"}`}>
        <div>{card.rank}</div>
        <div>{card.suit}</div>
      </div>

      {/* Old Maid / Queen Indicator */}
      {card.rank === "Q" && (
        <div className="absolute bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm top-1 right-1 border border-yellow-300">
          QUEEN
        </div>
      )}
    </motion.div>
  );
}
