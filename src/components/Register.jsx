import React, { useState } from "react";

export default function Register({ onSwitch, onSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      onSuccess();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center relative overflow-hidden">
      {/* Decorative blurred circles */}
      <div className="absolute w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative bg-white/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-fade-in">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">📝 Create Account</h2>
        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="p-3 border border-gray-200 rounded-xl bg-white/60 focus:ring-2 focus:ring-pink-400 outline-none shadow-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="p-3 border border-gray-200 rounded-xl bg-white/60 focus:ring-2 focus:ring-pink-400 outline-none shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 border border-gray-200 rounded-xl bg-white/60 focus:ring-2 focus:ring-pink-400 outline-none shadow-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="py-3 bg-gradient-to-r from-pink-500 to-red-500 hover:opacity-90 text-white rounded-xl font-semibold shadow-md transition"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-700">
          Already have an account?{" "}
          <button onClick={onSwitch} className="text-pink-500 font-semibold hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
