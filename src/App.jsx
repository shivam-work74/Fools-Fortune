import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameBoard from "./components/GameBoard";
import HowToPlay from "./components/HowToPlay";
import LandingPage from "./components/LandingPage";
import Lobby from "./components/Lobby";

export default function App() {
  const [screen, setScreen] = useState("landing"); // 'landing', 'lobby', 'game'
  const [playersCount, setPlayersCount] = useState(4);
  const [playerName, setPlayerName] = useState("Player");
  const [playerAvatar, setPlayerAvatar] = useState("😎"); // Default avatar
  const [showHow, setShowHow] = useState(false);

  // Navigation Handlers
  const goLobby = () => setScreen("lobby");
  const goBack = () => setScreen("landing");

  const handleStartGame = (mode, name, avatar) => {
    setPlayersCount(mode);
    setPlayerName(name);
    setPlayerAvatar(avatar); // Store avatar
    setScreen("game");
  };

  const handleReturnToMenu = () => {
    setScreen("landing");
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <motion.div
            key="landing"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onPlay={goLobby} onHowTo={() => setShowHow(true)} />
          </motion.div>
        )}

        {screen === "lobby" && (
          <motion.div
            key="lobby"
          >
            <Lobby onStartGame={handleStartGame} onBack={goBack} />
          </motion.div>
        )}

        {screen === "game" && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full bg-black"
          >
            <GameBoard
              playersCount={playersCount}
              playerName={playerName}
              playerAvatar={playerAvatar}
              onExit={handleReturnToMenu}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showHow && <HowToPlay onClose={() => setShowHow(false)} />}
    </>
  );
}
