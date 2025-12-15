"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CELL = 20;
const COLS = 28;
const ROWS = 31;

// 0=wall, 1=dot, 2=empty, 3=power, 4=ghost-house
const MAZE_TEMPLATE = `
0000000000000000000000000000
0111111111111001111111111110
0100001000001001000001000010
0300001000001001000001000030
0100001000001001000001000010
0111111111111111111111111110
0100001001000000001001000010
0100001001000000001001000010
0111111001111001111001111110
0000001000001001000001000000
0000001000001001000001000000
0000001002222222222001000000
0000001002000440002001000000
0000001002044444402001000000
2222222222044444402222222222
0000001002044444402001000000
0000001002000000002001000000
0000001002222222222001000000
0000001002000000002001000000
0111111111111001111111111110
0100001000001001000001000010
0100001000001001000001000010
0311001111111221111111001130
0001001001000000001001001000
0001001001000000001001001000
0111111001111001111001111110
0100000000001001000000000010
0100000000001001000000000010
0111111111111111111111111110
0000000000000000000000000000
`.trim().split('\n').map(row => row.split('').map(Number));

interface Ghost {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: number;
  color: string;
  scared: boolean;
  eaten: boolean;
  mode: "scatter" | "chase";
  homeX: number;
  homeY: number;
  inHouse: boolean;
  releaseTimer: number;
}

// Audio context for sound effects
class GameAudio {
  private ctx: AudioContext | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.ctx;
  }

  playTone(freq: number, duration: number, type: OscillatorType = "square", volume = 0.1) {
    const ctx = this.init();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  chomp() { this.playTone(200, 0.05, "square", 0.08); }
  powerUp() { this.playTone(600, 0.2, "sine", 0.1); this.playTone(800, 0.2, "sine", 0.1); }
  eatGhost() { this.playTone(400, 0.1, "sawtooth", 0.1); this.playTone(600, 0.1, "sawtooth", 0.1); }
  die() { for (let i = 0; i < 5; i++) setTimeout(() => this.playTone(200 - i * 30, 0.1, "sawtooth", 0.1), i * 100); }
  win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.playTone(f, 0.15, "sine", 0.1), i * 150)); }
}

const audio = new GameAudio();

export default function RoboPacman() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "gameover" | "levelcomplete">("waiting");

  const gameRef = useRef({
    maze: [] as number[][],
    player: { x: 14, y: 23, dir: 0, nextDir: 0, moving: false },
    ghosts: [] as Ghost[],
    powerTimer: 0,
    modeTimer: 0,
    dotCount: 0,
    frame: 0,
    keys: new Set<string>(),
  });

  const CANVAS_WIDTH = COLS * CELL;
  const CANVAS_HEIGHT = ROWS * CELL;

  const initGame = useCallback((newLevel: number = 1) => {
    const game = gameRef.current;
    game.maze = MAZE_TEMPLATE.map(row => [...row]);
    game.player = { x: 14, y: 23, dir: 2, nextDir: 2, moving: false };
    game.powerTimer = 0;
    game.modeTimer = 0;
    game.frame = 0;

    // Count dots
    game.dotCount = 0;
    game.maze.forEach(row => row.forEach(cell => { if (cell === 1 || cell === 3) game.dotCount++; }));

    // Initialize ghosts
    game.ghosts = [
      { x: 14, y: 11, targetX: 0, targetY: 0, direction: 0, color: "#ff0000", scared: false, eaten: false, mode: "scatter", homeX: 25, homeY: -3, inHouse: false, releaseTimer: 0 },
      { x: 12, y: 14, targetX: 0, targetY: 0, direction: 0, color: "#ffb8ff", scared: false, eaten: false, mode: "scatter", homeX: 2, homeY: -3, inHouse: true, releaseTimer: 30 + newLevel * 10 },
      { x: 14, y: 14, targetX: 0, targetY: 0, direction: 0, color: "#00ffff", scared: false, eaten: false, mode: "scatter", homeX: 25, homeY: 32, inHouse: true, releaseTimer: 60 + newLevel * 10 },
      { x: 16, y: 14, targetX: 0, targetY: 0, direction: 0, color: "#ffb852", scared: false, eaten: false, mode: "scatter", homeX: 2, homeY: 32, inHouse: true, releaseTimer: 90 + newLevel * 10 },
    ];
  }, []);

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
      const key = e.key.toLowerCase();
      game.keys.add(key);

      if ((e.key === " " || e.key === "Enter") && gameState !== "playing") {
        e.preventDefault();
        if (gameState === "levelcomplete") {
          setLevel(prev => prev + 1);
          initGame(level + 1);
          setGameState("playing");
        } else {
          startGame();
        }
      }

      // Direction mapping
      if (key === "arrowup" || key === "w") game.player.nextDir = 3;
      if (key === "arrowdown" || key === "s") game.player.nextDir = 1;
      if (key === "arrowleft" || key === "a") game.player.nextDir = 2;
      if (key === "arrowright" || key === "d") game.player.nextDir = 0;
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
  }, [gameState, startGame, initGame, level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const game = gameRef.current;

    const canMove = (x: number, y: number): boolean => {
      if (y < 0 || y >= ROWS) return false;
      if (x < 0 || x >= COLS) return y === 14; // Tunnel
      const cell = game.maze[y]?.[x];
      return cell !== 0 && cell !== 4;
    };

    const canMoveGhost = (x: number, y: number, fromHouse: boolean): boolean => {
      if (y < 0 || y >= ROWS) return false;
      if (x < 0 || x >= COLS) return y === 14;
      const cell = game.maze[y]?.[x];
      if (cell === 0) return false;
      if (cell === 4 && !fromHouse) return false;
      return true;
    };

    const dirs = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 0, dy: -1 }];

    const moveGhost = (ghost: Ghost) => {
      // Release from house
      if (ghost.inHouse) {
        ghost.releaseTimer--;
        if (ghost.releaseTimer <= 0) {
          ghost.inHouse = false;
          ghost.x = 14;
          ghost.y = 11;
        }
        return;
      }

      // If eaten, return to house
      if (ghost.eaten) {
        ghost.targetX = 14;
        ghost.targetY = 14;
        if (Math.abs(ghost.x - 14) < 0.5 && Math.abs(ghost.y - 14) < 0.5) {
          ghost.eaten = false;
          ghost.x = 14;
          ghost.y = 11;
        }
      } else if (ghost.scared) {
        // Random movement when scared
        ghost.targetX = Math.floor(Math.random() * COLS);
        ghost.targetY = Math.floor(Math.random() * ROWS);
      } else {
        // Chase or scatter
        if (ghost.mode === "chase") {
          ghost.targetX = game.player.x;
          ghost.targetY = game.player.y;
        } else {
          ghost.targetX = ghost.homeX;
          ghost.targetY = ghost.homeY;
        }
      }

      // Find best direction
      const validDirs: number[] = [];
      const opposite = (ghost.direction + 2) % 4;

      for (let i = 0; i < 4; i++) {
        if (i === opposite) continue;
        const nx = Math.round(ghost.x) + dirs[i].dx;
        const ny = Math.round(ghost.y) + dirs[i].dy;
        if (canMoveGhost(nx, ny, ghost.eaten)) {
          validDirs.push(i);
        }
      }

      if (validDirs.length > 0) {
        let bestDir = validDirs[0];
        let bestDist = Infinity;

        for (const dir of validDirs) {
          const nx = Math.round(ghost.x) + dirs[dir].dx;
          const ny = Math.round(ghost.y) + dirs[dir].dy;
          const dist = Math.hypot(nx - ghost.targetX, ny - ghost.targetY);
          if (dist < bestDist) {
            bestDist = dist;
            bestDir = dir;
          }
        }

        ghost.direction = bestDir;
      }

      // Move
      const speed = ghost.eaten ? 0.15 : (ghost.scared ? 0.05 : 0.08);
      ghost.x += dirs[ghost.direction].dx * speed;
      ghost.y += dirs[ghost.direction].dy * speed;

      // Tunnel wrap
      if (ghost.x < -1) ghost.x = COLS;
      if (ghost.x > COLS) ghost.x = -1;
    };

    const gameLoop = () => {
      game.frame++;
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#00d4ff";

      if (gameState === "playing") {
        const player = game.player;

        // Update power timer
        if (game.powerTimer > 0) {
          game.powerTimer--;
          if (game.powerTimer === 0) {
            game.ghosts.forEach(g => g.scared = false);
          }
        }

        // Mode switching
        game.modeTimer++;
        if (game.modeTimer % 600 === 0) {
          const newMode = game.ghosts[0].mode === "scatter" ? "chase" : "scatter";
          game.ghosts.forEach(g => { if (!g.scared) g.mode = newMode; });
        }

        // Player movement (every 6 frames for smoother pace)
        if (game.frame % 6 === 0) {
          // Try next direction
          const nx = Math.round(player.x) + dirs[player.nextDir].dx;
          const ny = Math.round(player.y) + dirs[player.nextDir].dy;
          if (canMove(nx, ny)) {
            player.dir = player.nextDir;
          }

          // Move in current direction
          const mx = Math.round(player.x) + dirs[player.dir].dx;
          const my = Math.round(player.y) + dirs[player.dir].dy;
          if (canMove(mx, my)) {
            player.x = mx;
            player.y = my;

            // Tunnel wrap
            if (player.x < 0) player.x = COLS - 1;
            if (player.x >= COLS) player.x = 0;

            // Eat dot
            const cell = game.maze[player.y]?.[player.x];
            if (cell === 1) {
              game.maze[player.y][player.x] = 2;
              game.dotCount--;
              setScore(prev => {
                const newScore = prev + 10;
                setHighScore(h => Math.max(h, newScore));
                return newScore;
              });
              audio.chomp();
            } else if (cell === 3) {
              game.maze[player.y][player.x] = 2;
              game.dotCount--;
              setScore(prev => prev + 50);
              game.powerTimer = 300;
              game.ghosts.forEach(g => { if (!g.eaten) g.scared = true; });
              audio.powerUp();
            }

            // Check win
            if (game.dotCount <= 0) {
              audio.win();
              setGameState("levelcomplete");
            }
          }
        }

        // Move ghosts
        if (game.frame % 3 === 0) {
          game.ghosts.forEach(moveGhost);
        }

        // Collision with ghosts
        game.ghosts.forEach(ghost => {
          if (ghost.inHouse || ghost.eaten) return;
          const dist = Math.hypot(player.x - ghost.x, player.y - ghost.y);
          if (dist < 0.8) {
            if (ghost.scared) {
              ghost.eaten = true;
              ghost.scared = false;
              setScore(prev => prev + 200);
              audio.eatGhost();
            } else {
              audio.die();
              setLives(prev => {
                if (prev <= 1) {
                  setGameState("gameover");
                  return 0;
                }
                // Reset positions
                player.x = 14;
                player.y = 23;
                player.dir = 2;
                game.ghosts.forEach((g, i) => {
                  g.x = [14, 12, 14, 16][i];
                  g.y = [11, 14, 14, 14][i];
                  g.scared = false;
                  g.eaten = false;
                  g.inHouse = i > 0;
                  g.releaseTimer = [0, 30, 60, 90][i];
                });
                return prev - 1;
              });
            }
          }
        });
      }

      // Render
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw maze
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const cell = game.maze[y]?.[x];
          const cx = x * CELL + CELL / 2;
          const cy = y * CELL + CELL / 2;

          if (cell === 0) {
            ctx.fillStyle = "#1a1a2e";
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
          } else if (cell === 1) {
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(cx, cy, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (cell === 3) {
            ctx.fillStyle = accentColor;
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw player
      const player = game.player;
      const px = player.x * CELL + CELL / 2;
      const py = player.y * CELL + CELL / 2;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(player.dir * Math.PI / 2);

      ctx.fillStyle = "#ffff00";
      ctx.shadowColor = "#ffff00";
      ctx.shadowBlur = 10;

      const mouthAngle = Math.abs(Math.sin(game.frame * 0.3)) * 0.4 + 0.1;
      ctx.beginPath();
      ctx.arc(0, 0, CELL / 2 - 2, mouthAngle * Math.PI, -mouthAngle * Math.PI, false);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Draw ghosts
      game.ghosts.forEach(ghost => {
        if (ghost.inHouse && ghost.releaseTimer > 30) return; // Don't draw until almost released

        const gx = ghost.x * CELL + CELL / 2;
        const gy = ghost.y * CELL + CELL / 2;

        let color = ghost.color;
        if (ghost.eaten) color = "rgba(255,255,255,0.3)";
        else if (ghost.scared) color = game.powerTimer < 60 && game.frame % 10 < 5 ? "#fff" : "#2222ff";

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = ghost.eaten ? 0 : 8;

        // Ghost body
        ctx.beginPath();
        ctx.arc(gx, gy - 2, CELL / 2 - 2, Math.PI, 0, false);
        ctx.lineTo(gx + CELL / 2 - 2, gy + CELL / 2 - 4);
        for (let i = 0; i < 4; i++) {
          const wx = gx + CELL / 2 - 2 - (i + 1) * (CELL - 4) / 4;
          const wy = gy + CELL / 2 - 4 + (i % 2 === 0 ? 3 : 0);
          ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.fill();

        // Eyes
        if (!ghost.eaten) {
          ctx.fillStyle = "#fff";
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(gx - 3, gy - 3, 3, 0, Math.PI * 2);
          ctx.arc(gx + 3, gy - 3, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = ghost.scared ? "#fff" : "#00f";
          ctx.beginPath();
          ctx.arc(gx - 2 + dirs[ghost.direction].dx * 1.5, gy - 3 + dirs[ghost.direction].dy * 1.5, 1.5, 0, Math.PI * 2);
          ctx.arc(gx + 4 + dirs[ghost.direction].dx * 1.5, gy - 3 + dirs[ghost.direction].dy * 1.5, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
      });

      // UI
      ctx.fillStyle = accentColor;
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${score}`, 10, CANVAS_HEIGHT - 8);
      ctx.textAlign = "center";
      ctx.fillText(`LEVEL ${level}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 8);
      ctx.textAlign = "right";
      ctx.fillText("🤖".repeat(lives), CANVAS_WIDTH - 10, CANVAS_HEIGHT - 8);

      // Overlays
      if (gameState !== "playing") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.textAlign = "center";

        if (gameState === "gameover") {
          ctx.fillStyle = "#ff4444";
          ctx.font = "bold 36px monospace";
          ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
          ctx.fillStyle = accentColor;
          ctx.font = "20px monospace";
          ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
          ctx.font = "14px monospace";
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillText("Press SPACE to retry", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
        } else if (gameState === "levelcomplete") {
          ctx.fillStyle = "#00ff00";
          ctx.font = "bold 36px monospace";
          ctx.fillText("LEVEL COMPLETE!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
          ctx.fillStyle = accentColor;
          ctx.font = "14px monospace";
          ctx.fillText("Press SPACE for next level", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        } else {
          ctx.fillStyle = accentColor;
          ctx.font = "bold 32px monospace";
          ctx.fillText("ROBO-PACMAN", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
          ctx.font = "14px monospace";
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.fillText("Collect data chips, avoid virus bots!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillText("Arrow Keys / WASD: Move", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
          ctx.fillStyle = accentColor;
          ctx.fillText("Press SPACE to start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, score, highScore, lives, level, initGame]);

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
