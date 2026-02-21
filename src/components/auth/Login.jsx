
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await login(username, password);
            if (result.success) {
                navigate("/dashboard");
            } else {
                setError(result.error || "Access Denied: Invalid Credentials");
            }
        } catch (err) {
            setError("Access Denied: Invalid Credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-plush flex items-center justify-center p-4 relative overflow-hidden font-serif text-[var(--text-primary)] transition-colors duration-500">
            {/* Ambient Lighting */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-yellow-900/10 rounded-full blur-[100px]" />

            {/* Back to Home */}
            <Link to="/" className="absolute top-6 left-6 text-yellow-600 font-black hover:text-yellow-500 text-xs font-sans tracking-[0.2em] uppercase transition-colors flex items-center gap-2 z-50">
                ← Back to Home
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[var(--bg-glass)] border border-[var(--border-primary)] rounded-[40px] p-12 shadow-[var(--shadow-premium)] backdrop-blur-xl relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10 pointer-events-none" />

                    <div className="text-center mb-10">
                        <div className="inline-block mb-4">
                            <span className="text-5xl drop-shadow-lg">🗝️</span>
                        </div>
                        <h2 className="text-3xl font-black text-gold tracking-tight uppercase">Member Login</h2>
                        <p className="text-[var(--text-muted)] text-[10px] mt-2 font-sans tracking-[0.3em] uppercase">Presentation of Credentials Required</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-900/20 border border-red-500/20 text-red-300 p-3 rounded-lg mb-6 text-center text-sm font-sans"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <label className={`absolute left-0 transition-all duration-300 pointer-events-none font-sans text-xs uppercase tracking-widest ${focusedField === 'username' || username ? '-top-5 text-yellow-500' : 'top-2 text-gray-500'}`}>
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full bg-transparent border-b border-[var(--border-primary)] py-2 text-[var(--text-primary)] focus:outline-none focus:border-yellow-500 transition-colors placeholder-transparent font-sans"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </div>

                        <div className="relative group">
                            <label className={`absolute left-0 transition-all duration-300 pointer-events-none font-sans text-xs uppercase tracking-widest ${focusedField === 'password' || password ? '-top-5 text-yellow-500' : 'top-2 text-gray-500'}`}>
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full bg-transparent border-b border-[var(--border-primary)] py-2 text-[var(--text-primary)] focus:outline-none focus:border-yellow-500 transition-colors placeholder-transparent font-sans"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-yellow-800 to-yellow-600 hover:from-yellow-700 hover:to-yellow-500 text-black font-bold text-sm uppercase tracking-[0.2em] rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(202,138,4,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Present Credentials"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-[var(--text-muted)] font-sans">Not on the guest list? </span>
                        <Link to="/register" className="text-yellow-600 hover:text-yellow-500 font-bold uppercase tracking-wider ml-2 underline decoration-yellow-500/30 hover:decoration-yellow-500">
                            Apply for Membership
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
