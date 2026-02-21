import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

// Reusable fade-in section
function FadeIn({ children, delay = 0, className = "" }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

const FEATURES = [
    { icon: "⚔️", title: "1-on-1 Duels", desc: "Face off against a single opponent in a pure battle of wits. Draw, match, and outmaneuver your rival." },
    { icon: "🎲", title: "Fortune's Chaos (4P)", desc: "Four players, one cursed Queen. Alliances form and shatter in this tornado of betrayal and luck." },
    { icon: "📊", title: "Live Leaderboard", desc: "Track your wins, losses, and rivalries. Ascend the Inner Circle rankings in real-time." },
    { icon: "🃏", title: "Real-Time Gameplay", desc: "Socket-powered live games synced across all players. Every move is instant, every card matters." },
    { icon: "🔮", title: "Private Tables", desc: "Generate a VIP code and invite exactly who you want. Your rules, your table, your legend." },
    { icon: "👑", title: "Rival Tracking", desc: "The game remembers who beat you. Build a nemesis list and settle scores in future matches." },
];

const HOW_TO = [
    { step: "01", title: "Join or Host", desc: "Create a private table or join one with an invitation code. Choose your game mode." },
    { step: "02", title: "Cards Are Dealt", desc: "All cards are distributed equally. Players immediately discard any pairs they hold." },
    { step: "03", title: "Draw & Match", desc: "On your turn, draw a random card from the player to your left. Match pairs and discard them." },
    { step: "04", title: "Avoid the Queen", desc: "The Queen of Spades has no match. The player left holding it when all others are done... is the Fool." },
];

const TESTIMONIALS = [
    { quote: "\"I thought I had the game won. Then I drew the Queen. I've never slept since.\"", name: "The Duchess of Spades", wins: "34 Wins" },
    { quote: "\"This game ruined my friendships. Five stars. Would lose everything again.\"", name: "Lord Ashwick", wins: "51 Wins" },
    { quote: "\"My nemesis is a user named 'queen_slayer'. I will find them.\"", name: "Anonymous Fool", wins: "12 Wins" },
];

export default function LandingPage() {
    const heroRef = useRef(null);

    return (
        <div className="w-full bg-plush text-amber-50 font-serif overflow-x-hidden">

            {/* ===== NAV BAR ===== */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/60 backdrop-blur-lg border-b border-yellow-500/10">
                <span className="text-xl font-black tracking-tighter text-gold">FOOL'S FORTUNE</span>
                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className="px-5 py-2 text-sm font-bold font-sans uppercase tracking-[0.15em] text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-900/20 hover:border-yellow-400 transition-all"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="px-5 py-2 text-sm font-bold font-sans uppercase tracking-[0.15em] bg-gradient-to-r from-yellow-700 to-yellow-600 text-black rounded-lg hover:from-yellow-600 hover:to-yellow-500 transition-all shadow-lg"
                    >
                        Register
                    </Link>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
                {/* Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-50%] left-[-20%] w-[100vw] h-[100vw] bg-purple-900/20 rounded-full blur-[150px] animate-pulse" />
                    <div className="absolute bottom-[-30%] right-[-10%] w-[80vw] h-[80vw] bg-yellow-900/10 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fbbf24 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
                </div>

                {/* Floating Cards */}
                <motion.div
                    initial={{ y: 60, rotate: -15, opacity: 0 }}
                    animate={{ y: 0, rotate: -12, opacity: 1 }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                    className="absolute left-[5%] lg:left-[12%] top-[20%] hidden lg:block"
                >
                    <div className="w-44 h-64 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-50" />
                        <span className="relative text-6xl text-yellow-500/80">J♠</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 60, rotate: 15, opacity: 0 }}
                    animate={{ y: 0, rotate: 12, opacity: 1 }}
                    transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
                    className="absolute right-[5%] lg:right-[12%] bottom-[20%] hidden lg:block"
                >
                    <div className="w-44 h-64 bg-gradient-to-br from-red-950 to-black rounded-2xl border border-red-900/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-50" />
                        <span className="relative text-6xl text-red-600/80">Q♥</span>
                    </div>
                </motion.div>

                {/* Hero Content */}
                <div className="z-10 text-center space-y-8 px-6 max-w-4xl relative">
                    <div className="absolute -inset-10 bg-black/40 blur-3xl -z-10 rounded-full" />

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }}>
                        <div className="inline-block mb-6 px-4 py-1.5 border border-yellow-500/30 rounded-full bg-black/40 backdrop-blur-sm">
                            <span className="text-xs font-sans tracking-[0.3em] text-yellow-500/80 uppercase">The Inner Circle Awaits</span>
                        </div>

                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-gold drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-none">
                            FOOL'S<br />FORTUNE
                        </h1>

                        <p className="mt-6 text-xl md:text-2xl text-amber-100/60 font-light tracking-wide max-w-2xl mx-auto italic">
                            "Only the bold dare to sit at this table. Will you walk away with everything, or be left holding the Queen?"
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                    >
                        <Link
                            to="/register"
                            className="group relative px-12 py-5 bg-gradient-to-r from-yellow-700 to-yellow-600 rounded-lg shadow-[0_0_40px_rgba(202,138,4,0.2)] hover:shadow-[0_0_60px_rgba(202,138,4,0.4)] transition-all transform hover:-translate-y-1 inline-block text-center"
                        >
                            <div className="absolute inset-0 border border-white/20 rounded-lg" />
                            <span className="relative text-lg font-bold tracking-[0.2em] text-black font-sans">
                                REQUEST ENTRY →
                            </span>
                        </Link>

                        <Link
                            to="/login"
                            className="px-12 py-5 rounded-lg border border-yellow-500/30 text-yellow-500/80 hover:text-yellow-400 hover:border-yellow-500/80 hover:bg-yellow-900/10 transition-all font-sans font-bold tracking-[0.2em] uppercase text-sm inline-block text-center"
                        >
                            Member Login
                        </Link>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-yellow-500/40"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <span className="text-xs font-sans tracking-widest uppercase">Scroll Down</span>
                    <span className="text-xl">↓</span>
                </motion.div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section className="relative py-32 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-purple-900/5 to-black/0 pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-20">
                        <p className="text-xs font-sans tracking-[0.4em] text-yellow-500/60 uppercase mb-4">The Arsenal</p>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                            Everything You Need to<br />
                            <span className="text-gold">Dominate</span>
                        </h2>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="group h-full bg-black/40 border border-white/5 hover:border-yellow-500/30 rounded-2xl p-8 transition-all duration-500 hover:bg-black/60 hover:shadow-[0_0_30px_rgba(202,138,4,0.05)]">
                                    <div className="text-4xl mb-5">{f.icon}</div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors">{f.title}</h3>
                                    <p className="text-gray-400 font-sans text-sm leading-relaxed">{f.desc}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== HOW TO PLAY SECTION ===== */}
            <section className="relative py-32 px-6 bg-gradient-to-b from-black/20 to-black/60">
                <div className="max-w-5xl mx-auto">
                    <FadeIn className="text-center mb-20">
                        <p className="text-xs font-sans tracking-[0.4em] text-yellow-500/60 uppercase mb-4">The House Rules</p>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter">How to Play</h2>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {HOW_TO.map((step, i) => (
                            <FadeIn key={i} delay={i * 0.15}>
                                <div className="flex gap-6 items-start group">
                                    <div className="flex-shrink-0 w-16 h-16 rounded-full border border-yellow-500/20 bg-yellow-900/10 flex items-center justify-center group-hover:border-yellow-500/60 transition-colors">
                                        <span className="font-mono text-yellow-500 font-bold text-lg">{step.step}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors">{step.title}</h3>
                                        <p className="text-gray-400 font-sans text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
                <div className="max-w-6xl mx-auto">
                    <FadeIn className="text-center mb-20">
                        <p className="text-xs font-sans tracking-[0.4em] text-yellow-500/60 uppercase mb-4">From the Table</p>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter">Words of the <span className="text-gold">Fallen</span></h2>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <FadeIn key={i} delay={i * 0.15}>
                                <div className="bg-black/50 border border-white/5 rounded-2xl p-8 hover:border-yellow-500/20 transition-all">
                                    <p className="text-amber-100/70 italic text-sm leading-relaxed mb-6 font-sans">{t.quote}</p>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                        <span className="text-white font-bold text-sm">{t.name}</span>
                                        <span className="text-yellow-500/60 font-mono text-xs font-sans">{t.wins}</span>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 to-purple-900/10 pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fbbf24 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                <FadeIn className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="inline-block mb-6 px-5 py-2 border border-yellow-500/30 rounded-full bg-black/40 backdrop-blur-sm">
                        <span className="text-xs font-sans tracking-[0.4em] text-yellow-500/80 uppercase">Last Chance</span>
                    </div>
                    <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-white mb-6">
                        The Table<br /><span className="text-gold">Is Set.</span>
                    </h2>
                    <p className="text-xl text-amber-100/50 font-light italic mb-12 font-sans">
                        Fortune favors the bold, and punishes the foolish. Which will you be?
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="group relative px-14 py-6 bg-gradient-to-r from-yellow-700 to-yellow-600 rounded-xl shadow-[0_0_50px_rgba(202,138,4,0.25)] hover:shadow-[0_0_80px_rgba(202,138,4,0.4)] transition-all transform hover:-translate-y-1 text-center"
                        >
                            <div className="absolute inset-0 border border-white/20 rounded-xl" />
                            <span className="relative text-xl font-bold tracking-[0.2em] text-black font-sans">JOIN FREE →</span>
                        </Link>
                        <Link
                            to="/login"
                            className="px-14 py-6 rounded-xl border border-yellow-500/30 text-yellow-400 hover:border-yellow-500/80 hover:bg-yellow-900/10 transition-all font-sans font-bold tracking-[0.2em] uppercase text-center"
                        >
                            Sign In
                        </Link>
                    </div>
                </FadeIn>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="border-t border-white/5 py-10 px-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <span className="text-xl font-black tracking-tighter text-gold">FOOL'S FORTUNE</span>
                    <div className="flex items-center gap-8 text-[11px] font-sans tracking-[0.2em] uppercase text-amber-500/30">
                        <span>Est. 2024</span>
                        <span>High Stakes • High Reward</span>
                        <span>Exclusive Access</span>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="text-xs font-sans text-yellow-500/50 hover:text-yellow-400 uppercase tracking-widest transition-colors">Login</Link>
                        <Link to="/register" className="text-xs font-sans text-yellow-500/50 hover:text-yellow-400 uppercase tracking-widest transition-colors">Register</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
