"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Asteroid {
  x: number; y: number; vx: number; vy: number;
  size: number; rotation: number; rotationSpeed: number; vertices: number[];
}

interface Bullet {
  x: number; y: number; vx: number; vy: number; life: number;
}

interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; color: string;
}

export default function RoboAsteroids() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "gameover">("waiting");

  const gameRef = useRef({
    ship: { x: 400, y: 300, angle: -Math.PI / 2, vx: 0, vy: 0 },
    asteroids: [] as Asteroid[],
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    keys: new Set<string>(),
    lastShot: 0,
    invulnerable: 0,
  });

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;

  const createAsteroid = useCallback((x?: number, y?: number, size?: number): Asteroid => {
    const s = size || Math.random() * 25 + 35;
    const vertices: number[] = [];
    const numVertices = Math.floor(Math.random() * 4) + 8;
    for (let i = 0; i < numVertices; i++) {
      vertices.push(0.7 + Math.random() * 0.3);
    }
    return {
      x: x ?? Math.random() * CANVAS_WIDTH,
      y: y ?? Math.random() * CANVAS_HEIGHT,
      vx: (Math.random() - 0.5) * 2.5,
      vy: (Math.random() - 0.5) * 2.5,
      size: s,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      vertices,
    };
  }, []);

  const spawnParticles = useCallback((x: number, y: number, count: number, color: string) => {
    const game = gameRef.current;
    for (let i = 0; i < count; i++) {
      game.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30 + Math.random() * 20,
        color,
      });
    }
  }, []);

  const initGame = useCallback((newLevel: number = 1) => {
    const game = gameRef.current;
    game.ship = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, angle: -Math.PI / 2, vx: 0, vy: 0 };
    game.asteroids = [];
    game.bullets = [];
    game.particles = [];
    game.invulnerable = 120;

    const asteroidCount = 3 + newLevel;
    for (let i = 0; i < asteroidCount; i++) {
      let asteroid;
      do {
        asteroid = createAsteroid();
      } while (Math.hypot(asteroid.x - game.ship.x, asteroid.y - game.ship.y) < 150);
      game.asteroids.push(asteroid);
    }
  }, [createAsteroid]);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    initGame(1);
    setGameState("playing");
  }, [initGame]);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    const game = gameRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      game.keys.add(e.key.toLowerCase());
      if ((e.key === " " || e.key === "Enter") && gameState !== "playing") {
        e.preventDefault();
        startGame();
      }
      if (e.key === "p" && gameState === "playing") {
        // Could add pause here
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      game.keys.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const game = gameRef.current;

    const gameLoop = () => {
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#00d4ff";

      if (gameState === "playing") {
        const ship = game.ship;

        // Controls
        if (game.keys.has("arrowleft") || game.keys.has("a")) ship.angle -= 0.07;
        if (game.keys.has("arrowright") || game.keys.has("d")) ship.angle += 0.07;
        if (game.keys.has("arrowup") || game.keys.has("w")) {
          ship.vx += Math.cos(ship.angle) * 0.12;
          ship.vy += Math.sin(ship.angle) * 0.12;
        }

        // Shooting
        const now = Date.now();
        if (game.keys.has(" ") && now - game.lastShot > 150) {
          game.bullets.push({
            x: ship.x + Math.cos(ship.angle) * 18,
            y: ship.y + Math.sin(ship.angle) * 18,
            vx: Math.cos(ship.angle) * 12 + ship.vx * 0.3,
            vy: Math.sin(ship.angle) * 12 + ship.vy * 0.3,
            life: 50,
          });
          game.lastShot = now;
        }

        // Ship physics
        ship.x += ship.vx;
        ship.y += ship.vy;
        ship.vx *= 0.995;
        ship.vy *= 0.995;

        // Wrap
        if (ship.x < 0) ship.x = CANVAS_WIDTH;
        if (ship.x > CANVAS_WIDTH) ship.x = 0;
        if (ship.y < 0) ship.y = CANVAS_HEIGHT;
        if (ship.y > CANVAS_HEIGHT) ship.y = 0;

        // Invulnerability countdown
        if (game.invulnerable > 0) game.invulnerable--;

        // Update bullets
        game.bullets = game.bullets.filter(b => {
          b.x += b.vx;
          b.y += b.vy;
          b.life--;
          if (b.x < 0) b.x = CANVAS_WIDTH;
          if (b.x > CANVAS_WIDTH) b.x = 0;
          if (b.y < 0) b.y = CANVAS_HEIGHT;
          if (b.y > CANVAS_HEIGHT) b.y = 0;
          return b.life > 0;
        });

        // Update asteroids
        game.asteroids.forEach(a => {
          a.x += a.vx;
          a.y += a.vy;
          a.rotation += a.rotationSpeed;
          if (a.x < -a.size) a.x = CANVAS_WIDTH + a.size;
          if (a.x > CANVAS_WIDTH + a.size) a.x = -a.size;
          if (a.y < -a.size) a.y = CANVAS_HEIGHT + a.size;
          if (a.y > CANVAS_HEIGHT + a.size) a.y = -a.size;
        });

        // Update particles
        game.particles = game.particles.filter(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.95;
          p.vy *= 0.95;
          p.life--;
          return p.life > 0;
        });

        // Bullet-asteroid collisions
        game.bullets = game.bullets.filter(bullet => {
          for (let i = game.asteroids.length - 1; i >= 0; i--) {
            const a = game.asteroids[i];
            if (Math.hypot(bullet.x - a.x, bullet.y - a.y) < a.size) {
              // Hit!
              const points = Math.floor(150 / a.size * 10);
              setScore(prev => {
                const newScore = prev + points;
                setHighScore(h => Math.max(h, newScore));
                return newScore;
              });

              spawnParticles(a.x, a.y, 8, accentColor);

              // Split
              if (a.size > 20) {
                game.asteroids.push(
                  createAsteroid(a.x, a.y, a.size * 0.55),
                  createAsteroid(a.x, a.y, a.size * 0.55)
                );
              }
              game.asteroids.splice(i, 1);

              return false;
            }
          }
          return true;
        });

        // Ship-asteroid collisions
        if (game.invulnerable <= 0) {
          for (const a of game.asteroids) {
            if (Math.hypot(ship.x - a.x, ship.y - a.y) < a.size + 12) {
              spawnParticles(ship.x, ship.y, 20, "#ff4444");
              setLives(prev => {
                if (prev <= 1) {
                  setGameState("gameover");
                  return 0;
                }
                // Respawn
                ship.x = CANVAS_WIDTH / 2;
                ship.y = CANVAS_HEIGHT / 2;
                ship.vx = 0;
                ship.vy = 0;
                game.invulnerable = 120;
                return prev - 1;
              });
              break;
            }
          }
        }

        // Level complete
        if (game.asteroids.length === 0) {
          setLevel(prev => {
            const newLevel = prev + 1;
            initGame(newLevel);
            return newLevel;
          });
        }
      }

      // Render
      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 0; i < 80; i++) {
        const x = (i * 97 + 13) % CANVAS_WIDTH;
        const y = (i * 151 + 7) % CANVAS_HEIGHT;
        const size = (i % 3) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Particles
      game.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 50;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Asteroids
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      game.asteroids.forEach(a => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        for (let i = 0; i < a.vertices.length; i++) {
          const angle = (i / a.vertices.length) * Math.PI * 2;
          const r = a.size * a.vertices[i];
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, a.size * 0.3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      // Bullets
      ctx.fillStyle = accentColor;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 10;
      game.bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Ship
      const ship = game.ship;
      if (gameState === "playing" && (game.invulnerable <= 0 || Math.floor(game.invulnerable / 5) % 2 === 0)) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = accentColor;
        ctx.fillStyle = "rgba(0, 212, 255, 0.15)";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-12, -10);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Thruster
        if (game.keys.has("arrowup") || game.keys.has("w")) {
          ctx.fillStyle = "#ff6600";
          ctx.shadowColor = "#ff6600";
          ctx.beginPath();
          ctx.moveTo(-8, -4);
          ctx.lineTo(-20 - Math.random() * 8, 0);
          ctx.lineTo(-8, 4);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.shadowBlur = 0;

      // UI
      ctx.fillStyle = accentColor;
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${score}`, 15, 30);
      ctx.fillText(`HIGH: ${highScore}`, 15, 55);
      ctx.textAlign = "right";
      ctx.fillText(`LEVEL ${level}`, CANVAS_WIDTH - 15, 30);
      ctx.fillText("🤖".repeat(lives), CANVAS_WIDTH - 15, 55);

      // Overlays
      if (gameState !== "playing") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.textAlign = "center";

        if (gameState === "gameover") {
          ctx.fillStyle = "#ff4444";
          ctx.font = "bold 42px monospace";
          ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
          ctx.fillStyle = accentColor;
          ctx.font = "24px monospace";
          ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
          ctx.font = "16px monospace";
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.fillText("Press SPACE to try again", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
        } else {
          ctx.fillStyle = accentColor;
          ctx.font = "bold 42px monospace";
          ctx.fillText("ROBO-ASTEROIDS", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);
          ctx.font = "16px monospace";
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.fillText("Destroy rogue gears before they destroy you!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 25);
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.fillText("← → or A/D: Rotate    ↑ or W: Thrust    SPACE: Fire", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
          ctx.fillStyle = accentColor;
          ctx.fillText("Press SPACE to launch", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, score, highScore, lives, level, createAsteroid, initGame, spawnParticles]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-lg"
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-lg cursor-pointer"
        onClick={() => containerRef.current?.focus()}
      />
    </div>
  );
}
