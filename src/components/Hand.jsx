import React, { useState } from "react";
import Card from "./Card";
import { motion, AnimatePresence } from "framer-motion";

export default function Hand({
  cards = [],
  hideCards = false,
  onCardClick,
  onStackClick,
  selectedCardId,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const total = cards.length;
  const fanAngle = 50;

  // If it's a stack (opponent), make the whole hand clickable
  if (hideCards && typeof onStackClick === "function") {
    return (
      <div
        className="relative flex justify-center items-center h-48 cursor-pointer select-none"
        onClick={() => onStackClick()}
        style={{ minHeight: "6rem" }}
      >
        <AnimatePresence>
          {cards.map((c, i) => {
            const rotate = ((i - total / 2) / total) * fanAngle;
            const offsetX = ((i - total / 2) / total) * 35;
            const offsetY = Math.abs(i - total / 2) * -3;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: offsetX,
                  y: offsetY,
                  rotate,
                }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.35 }}
                className="absolute drop-shadow-lg"
                style={{ zIndex: i }}
              >
                <Card card={c} hidden={true} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  // Otherwise, render each card individually (for your hand)
  return (
    <div className="relative flex justify-center items-center h-48 select-none">
      <AnimatePresence>
        {cards.map((c, i) => {
          const rotate = ((i - total / 2) / total) * fanAngle;
          const offsetX = ((i - total / 2) / total) * 35;
          const offsetY = Math.abs(i - total / 2) * -3;
          const isHovered = hoveredIndex === i;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: isHovered ? 1.1 : 1,
                x: offsetX,
                y: offsetY,
                rotate,
              }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35 }}
              className="absolute cursor-pointer drop-shadow-lg"
              style={{ zIndex: i }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onCardClick && onCardClick(i)}
            >
              <Card
                card={c}
                hidden={false}
                isSelected={selectedCardId === c.id}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
