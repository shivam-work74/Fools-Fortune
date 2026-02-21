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

  // If it's a stack (opponent), make the cards interactive (but face down)
  if (hideCards) {
    return (
      <div
        className="relative flex justify-center items-center h-48 select-none"
        style={{ minHeight: "6rem" }}
      >
        <AnimatePresence>
          {cards.map((c, i) => {
            const rotate = ((i - total / 2) / total) * fanAngle;
            const offsetX = ((i - total / 2) / total) * 35;
            const offsetY = Math.abs(i - total / 2) * -3;
            // Allow clicking specific card if onCardClick is provided
            // onStackClick is usually "click anywhere", but we want specific card picking now.
            // We'll prefer onCardClick if available.
            const clickHandler = () => {
              if (onCardClick) onCardClick(i);
              else if (onStackClick) onStackClick();
            };

            return (
              <motion.div
                key={c.id}
                id={`target-card-${c.id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: offsetX,
                  y: offsetY,
                  rotate,
                }}
                whileHover={{ scale: 1.1, y: -10, zIndex: 100 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.35 }}
                className="absolute drop-shadow-lg cursor-pointer"
                style={{ zIndex: i }}
                onClick={clickHandler}
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
              id={hideCards ? `target-card-${c.id}` : `card-${c.id}`}
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
