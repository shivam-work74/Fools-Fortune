
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import LandingPage from "./components/LandingPage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/Dashboard";
import Lobby from "./components/Lobby";
import GameBoard from "./components/GameBoard";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading protocols...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<LandingPageWrapper />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/lobby" element={
              <PrivateRoute>
                <Lobby />
              </PrivateRoute>
            } />

            <Route path="/game/:lobbyId" element={
              <PrivateRoute>
                <GameBoard />
              </PrivateRoute>
            } />

          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

function LandingPageWrapper() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;
  return <LandingPage onPlay={() => window.location.href = '/login'} onHowTo={() => { }} />; // Simplified for now
}

