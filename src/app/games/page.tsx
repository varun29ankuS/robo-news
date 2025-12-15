"use client";

import { useState } from "react";
import Header from "@/components/Header";
import dynamic from "next/dynamic";

const RoboPong = dynamic(() => import("@/components/games/RoboPong"), { ssr: false, loading: () => <GameLoader /> });
const RoboAsteroids = dynamic(() => import("@/components/games/RoboAsteroids"), { ssr: false, loading: () => <GameLoader /> });
const RoboPacman = dynamic(() => import("@/components/games/RoboPacman"), { ssr: false, loading: () => <GameLoader /> });
const RoboBomber = dynamic(() => import("@/components/games/RoboBomber"), { ssr: false, loading: () => <GameLoader /> });

function GameLoader() {
  return (
    <div className="flex items-center justify-center h-[400px] border border-[var(--border-color)] rounded-lg bg-[#0a0a0a]">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🤖</div>
        <div className="text-[var(--accent)] font-mono text-sm">LOADING GAME...</div>
      </div>
    </div>
  );
}

const GAMES = [
  {
    id: "pong",
    name: "ROBO-PONG",
    icon: "🏓",
    description: "2-player paddle battle",
    longDesc: "Classic Pong reimagined with robot paddles. Challenge a friend in this local multiplayer showdown!",
    controls: "P1: W/S │ P2: ↑/↓ │ Space: Start",
    component: RoboPong,
    color: "#00ff88",
  },
  {
    id: "asteroids",
    name: "ROBO-ASTEROIDS",
    icon: "🚀",
    description: "Blast rogue gears in space",
    longDesc: "Pilot your robot ship through a deadly field of malfunctioning gears. How long can you survive?",
    controls: "WASD/Arrows: Move │ Space: Shoot │ P: Pause",
    component: RoboAsteroids,
    color: "#ff6600",
  },
  {
    id: "pacman",
    name: "ROBO-PACMAN",
    icon: "👾",
    description: "Collect data, avoid viruses",
    longDesc: "Navigate the mainframe, collect data chips, and avoid the deadly virus bots hunting you down!",
    controls: "WASD/Arrows: Move │ Space: Start │ P: Pause",
    component: RoboPacman,
    color: "#ffff00",
  },
  {
    id: "bomber",
    name: "ROBO-BOMBER",
    icon: "💣",
    description: "Blast bots, clear the grid",
    longDesc: "Plant bombs strategically to destroy rogue robots and clear destructible barriers. Collect powerups!",
    controls: "WASD/Arrows: Move │ Space: Bomb │ R: Restart",
    component: RoboBomber,
    color: "#ff4400",
  },
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const ActiveGame = GAMES.find(g => g.id === selectedGame)?.component;
  const selectedGameData = GAMES.find(g => g.id === selectedGame);

  return (
    <div className="main-container min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
        {!selectedGame ? (
          <>
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-block">
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--accent)] mb-3 font-mono tracking-tight">
                  ROBO-GAMES
                </h1>
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
              </div>
              <p className="text-gray-500 mt-4 text-sm">
                Retro arcade classics • Robot edition
              </p>
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                  className="group relative overflow-hidden rounded-xl border border-[var(--border-color)] bg-gradient-to-b from-[#111] to-[#0a0a0a] transition-all duration-500 hover:border-[var(--accent)] hover:shadow-[0_0_60px_rgba(var(--accent-rgb),0.2)] text-left"
                  style={{
                    transform: hoveredGame === game.id ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at center, ${game.color}, transparent 70%)` }}
                  />

                  {/* Content */}
                  <div className="relative p-8">
                    {/* Icon */}
                    <div className="text-7xl mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                      {game.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-2 font-mono transition-colors group-hover:text-[var(--accent)]">
                      {game.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-sm mb-4">{game.description}</p>
                    <p className="text-gray-600 text-xs leading-relaxed">{game.longDesc}</p>

                    {/* Play button */}
                    <div className="mt-6 flex items-center gap-3">
                      <div className="px-4 py-2 bg-[var(--accent)] text-[#0a0a0a] rounded font-mono text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        ▶ PLAY NOW
                      </div>
                      <div className="text-xs text-gray-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        {game.controls.split("│")[0]}
                      </div>
                    </div>
                  </div>

                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Controls Reference */}
            <div className="max-w-2xl mx-auto">
              <div className="border border-[var(--border-color)] rounded-lg bg-[#111] p-6">
                <h3 className="text-sm font-bold text-[var(--accent)] mb-4 font-mono text-center">
                  UNIVERSAL CONTROLS
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl mb-2">⬆️⬇️⬅️➡️</div>
                    <div className="text-xs text-gray-500">ARROW KEYS</div>
                    <div className="text-xs text-gray-600">Movement</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">WASD</div>
                    <div className="text-xs text-gray-500">ALT MOVEMENT</div>
                    <div className="text-xs text-gray-600">Same as arrows</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">␣</div>
                    <div className="text-xs text-gray-500">SPACEBAR</div>
                    <div className="text-xs text-gray-600">Action / Start</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-2">P</div>
                    <div className="text-xs text-gray-500">PAUSE</div>
                    <div className="text-xs text-gray-600">Pause game</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Game View */}
            <div className="mb-6">
              <button
                onClick={() => setSelectedGame(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-[var(--accent)] transition-colors font-mono text-sm group"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform">◀</span>
                <span>BACK TO ARCADE</span>
              </button>
            </div>

            {/* Game Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{selectedGameData?.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--accent)] font-mono">
                    {selectedGameData?.name}
                  </h2>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {selectedGameData?.controls}
                  </p>
                </div>
              </div>
            </div>

            {/* Game Canvas */}
            <div className="flex justify-center bg-[#050505] rounded-xl p-4 border border-[var(--border-color)]">
              {ActiveGame && <ActiveGame />}
            </div>

            {/* Quick Tips */}
            <div className="mt-6 text-center text-xs text-gray-600 font-mono">
              <span className="text-gray-500">TIP:</span> Click on the game area to focus, then use keyboard controls
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gray-600 font-mono">
          ROBO-GAMES • Part of ROBO-NEWS • Built with ❤️ and 🤖
        </div>
      </footer>
    </div>
  );
}
