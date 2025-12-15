"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CELL = 32;
const COLS = 15;
const ROWS = 13;

// 0=empty, 1=wall(indestructible), 2=brick(destructible), 3=powerup-bomb, 4=powerup-flame, 5=powerup-speed
const createMaze = (): number[][] => {
  const maze: number[][] = [];
  for (let y = 0; y < ROWS; y++) {
    const row: number[] = [];
    for (let x = 0; x < COLS; x++) {
      if (y === 0 || y === ROWS - 1 || x === 0 || x === COLS - 1) {
        row.push(1); // Border walls
      } else if (x % 2 === 0 && y % 2 === 0) {
        row.push(1); // Fixed pillars
      } else if ((x <= 2 && y <= 2) || (x >= COLS - 3 && y >= ROWS - 3)) {
        row.push(0); // Clear spawn areas
      } else if (Math.random() < 0.7) {
        row.push(2); // Bricks
      } else {
        row.push(0);
      }
    }
    maze.push(row);
  }
  return maze;
};

interface Bomb {
  x: number;
  y: number;
  timer: number;
  range: number;
  owner: "player" | "enemy";
}

interface Explosion {
  x: number;
  y: number;
  timer: number;
  directions: { dx: number; dy: number; length: number }[];
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: number;
  alive: boolean;
}

// Audio
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

  placeBomb() { this.playTone(100, 0.1, "sine", 0.15); }
  explode() {
    this.playTone(80, 0.3, "sawtooth", 0.2);
    setTimeout(() => this.playTone(60, 0.2, "sawtooth", 0.15), 50);
  }
  powerup() { this.playTone(440, 0.1, "sine", 0.1); this.playTone(660, 0.1, "sine", 0.1); }
  die() { for (let i = 0; i < 4; i++) setTimeout(() => this.playTone(200 - i * 40, 0.15, "sawtooth", 0.12), i * 80); }
  win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.playTone(f, 0.15, "sine", 0.12), i * 120)); }
  enemyDie() { this.playTone(300, 0.1, "square", 0.1); this.playTone(200, 0.15, "square", 0.1); }
}

const audio = new GameAudio();

export default function RoboBomber() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "gameover" | "levelcomplete">("waiting");

  const gameRef = useRef({
    maze: [] as number[][],
    player: { x: 1, y: 1, speed: 0.08, maxBombs: 1, bombRange: 2, activeBombs: 0 },
    bombs: [] as Bomb[],
    explosions: [] as Explosion[],
    enemies: [] as Enemy[],
    keys: new Set<string>(),
    frame: 0,
    invulnerable: 0,
  });

  const CANVAS_WIDTH = COLS * CELL;
  const CANVAS_HEIGHT = ROWS * CELL;

  const initGame = useCallback((newLevel: number = 1) => {
    const game = gameRef.current;
    game.maze = createMaze();
    game.player = { x: 1, y: 1, speed: 0.06 + newLevel * 0.005, maxBombs: 1, bombRange: 2, activeBombs: 0 };
    game.bombs = [];
    game.explosions = [];
    game.invulnerable = 60;
    game.frame = 0;

    // Spawn enemies
    const enemyCount = 2 + newLevel;
    game.enemies = [];
    for (let i = 0; i < enemyCount; i++) {
      let ex, ey;
      do {
        ex = Math.floor(Math.random() * (COLS - 4)) + 2;
        ey = Math.floor(Math.random() * (ROWS - 4)) + 2;
      } while (game.maze[ey][ex] !== 0 || (ex < 4 && ey < 4));

      game.enemies.push({
        x: ex,
        y: ey,
        vx: 0,
        vy: 0,
        direction: Math.floor(Math.random() * 4),
        alive: true,
      });
    }

    // Add some powerups under bricks
    let powerupsPlaced = 0;
    for (let y = 0; y < ROWS && powerupsPlaced < 3; y++) {
      for (let x = 0; x < COLS && powerupsPlaced < 3; x++) {
        if (game.maze[y][x] === 2 && Math.random() < 0.1) {
          game.maze[y][x] = 20 + Math.floor(Math.random() * 3); // 20=bomb, 21=flame, 22=speed (hidden under brick)
          powerupsPlaced++;
        }
      }
    }
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

      // Place bomb
      if (e.key === " " && gameState === "playing") {
        e.preventDefault();
        const px = Math.round(game.player.x);
        const py = Math.round(game.player.y);
        if (game.player.activeBombs < game.player.maxBombs && !game.bombs.some(b => b.x === px && b.y === py)) {
          game.bombs.push({ x: px, y: py, timer: 150, range: game.player.bombRange, owner: "player" });
          game.player.activeBombs++;
          audio.placeBomb();
        }
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
  }, [gameState, startGame, initGame, level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const game = gameRef.current;

    const canMove = (x: number, y: number): boolean => {
      const cell = game.maze[Math.floor(y)]?.[Math.floor(x)];
      if (cell === 1 || cell === 2 || (cell >= 20 && cell <= 22)) return false;
      if (game.bombs.some(b => Math.floor(x) === b.x && Math.floor(y) === b.y)) return false;
      return true;
    };

    const explode = (bomb: Bomb) => {
      audio.explode();
      const directions = [
        { dx: 1, dy: 0, length: 0 },
        { dx: -1, dy: 0, length: 0 },
        { dx: 0, dy: 1, length: 0 },
        { dx: 0, dy: -1, length: 0 },
      ];

      for (const dir of directions) {
        for (let i = 1; i <= bomb.range; i++) {
          const nx = bomb.x + dir.dx * i;
          const ny = bomb.y + dir.dy * i;
          const cell = game.maze[ny]?.[nx];

          if (cell === 1) break; // Wall stops explosion
          dir.length = i;

          if (cell === 2) {
            game.maze[ny][nx] = 0; // Destroy brick
            setScore(prev => prev + 10);
            break;
          }
          if (cell >= 20 && cell <= 22) {
            game.maze[ny][nx] = cell - 17; // Reveal powerup (20->3, 21->4, 22->5)
            break;
          }
        }
      }

      game.explosions.push({ x: bomb.x, y: bomb.y, timer: 30, directions });
      if (bomb.owner === "player") game.player.activeBombs--;
    };

    const dirs = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 0, dy: -1 }];

    const gameLoop = () => {
      game.frame++;
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#00d4ff";

      if (gameState === "playing") {
        const player = game.player;
        if (game.invulnerable > 0) game.invulnerable--;

        // Player movement
        let dx = 0, dy = 0;
        if (game.keys.has("arrowup") || game.keys.has("w")) dy = -player.speed;
        if (game.keys.has("arrowdown") || game.keys.has("s")) dy = player.speed;
        if (game.keys.has("arrowleft") || game.keys.has("a")) dx = -player.speed;
        if (game.keys.has("arrowright") || game.keys.has("d")) dx = player.speed;

        // Move with collision
        const newX = player.x + dx;
        const newY = player.y + dy;
        const margin = 0.2;

        if (dx !== 0) {
          const testX = dx > 0 ? newX + 0.5 - margin : newX - 0.5 + margin;
          if (canMove(testX, player.y - 0.4) && canMove(testX, player.y + 0.4)) {
            player.x = newX;
          }
        }
        if (dy !== 0) {
          const testY = dy > 0 ? newY + 0.5 - margin : newY - 0.5 + margin;
          if (canMove(player.x - 0.4, testY) && canMove(player.x + 0.4, testY)) {
            player.y = newY;
          }
        }

        // Collect powerups
        const px = Math.round(player.x);
        const py = Math.round(player.y);
        const cell = game.maze[py]?.[px];
        if (cell === 3) { player.maxBombs++; game.maze[py][px] = 0; audio.powerup(); setScore(prev => prev + 100); }
        if (cell === 4) { player.bombRange++; game.maze[py][px] = 0; audio.powerup(); setScore(prev => prev + 100); }
        if (cell === 5) { player.speed = Math.min(0.15, player.speed + 0.02); game.maze[py][px] = 0; audio.powerup(); setScore(prev => prev + 100); }

        // Update bombs
        game.bombs = game.bombs.filter(bomb => {
          bomb.timer--;
          if (bomb.timer <= 0) {
            explode(bomb);
            return false;
          }
          return true;
        });

        // Update explosions
        game.explosions = game.explosions.filter(exp => {
          exp.timer--;
          return exp.timer > 0;
        });

        // Check player hit by explosion
        if (game.invulnerable <= 0) {
          for (const exp of game.explosions) {
            // Center
            if (Math.abs(player.x - exp.x) < 0.6 && Math.abs(player.y - exp.y) < 0.6) {
              audio.die();
              setLives(prev => {
                if (prev <= 1) { setGameState("gameover"); return 0; }
                player.x = 1; player.y = 1; game.invulnerable = 90;
                return prev - 1;
              });
              break;
            }
            // Rays
            for (const dir of exp.directions) {
              for (let i = 1; i <= dir.length; i++) {
                const ex = exp.x + dir.dx * i;
                const ey = exp.y + dir.dy * i;
                if (Math.abs(player.x - ex) < 0.6 && Math.abs(player.y - ey) < 0.6) {
                  audio.die();
                  setLives(prev => {
                    if (prev <= 1) { setGameState("gameover"); return 0; }
                    player.x = 1; player.y = 1; game.invulnerable = 90;
                    return prev - 1;
                  });
                  break;
                }
              }
            }
          }
        }

        // Move enemies
        if (game.frame % 3 === 0) {
          game.enemies.forEach(enemy => {
            if (!enemy.alive) return;

            // Simple AI: change direction randomly or when blocked
            if (Math.random() < 0.02) {
              enemy.direction = Math.floor(Math.random() * 4);
            }

            const dir = dirs[enemy.direction];
            const nx = enemy.x + dir.dx * 0.05;
            const ny = enemy.y + dir.dy * 0.05;

            const cellX = Math.floor(nx + dir.dx * 0.5);
            const cellY = Math.floor(ny + dir.dy * 0.5);
            const cell = game.maze[cellY]?.[cellX];

            if (cell !== 0 || game.bombs.some(b => b.x === cellX && b.y === cellY)) {
              // Blocked, change direction
              enemy.direction = Math.floor(Math.random() * 4);
            } else {
              enemy.x = nx;
              enemy.y = ny;
            }

            // Check collision with player
            if (game.invulnerable <= 0 && Math.hypot(player.x - enemy.x, player.y - enemy.y) < 0.7) {
              audio.die();
              setLives(prev => {
                if (prev <= 1) { setGameState("gameover"); return 0; }
                player.x = 1; player.y = 1; game.invulnerable = 90;
                return prev - 1;
              });
            }

            // Check if enemy hit by explosion
            for (const exp of game.explosions) {
              if (Math.abs(enemy.x - exp.x) < 0.6 && Math.abs(enemy.y - exp.y) < 0.6) {
                enemy.alive = false;
                audio.enemyDie();
                setScore(prev => prev + 200);
              }
              for (const dir of exp.directions) {
                for (let i = 1; i <= dir.length; i++) {
                  if (Math.abs(enemy.x - (exp.x + dir.dx * i)) < 0.6 && Math.abs(enemy.y - (exp.y + dir.dy * i)) < 0.6) {
                    enemy.alive = false;
                    audio.enemyDie();
                    setScore(prev => prev + 200);
                  }
                }
              }
            }
          });

          // Check win
          if (game.enemies.every(e => !e.alive)) {
            audio.win();
            setGameState("levelcomplete");
          }
        }
      }

      // Render
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw maze
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const cell = game.maze[y][x];
          const cx = x * CELL;
          const cy = y * CELL;

          if (cell === 1) {
            ctx.fillStyle = "#333";
            ctx.fillRect(cx, cy, CELL, CELL);
            ctx.strokeStyle = "#555";
            ctx.strokeRect(cx + 2, cy + 2, CELL - 4, CELL - 4);
          } else if (cell === 2 || (cell >= 20 && cell <= 22)) {
            ctx.fillStyle = "#654321";
            ctx.fillRect(cx, cy, CELL, CELL);
            ctx.strokeStyle = "#8B4513";
            ctx.lineWidth = 2;
            ctx.strokeRect(cx + 3, cy + 3, CELL - 6, CELL - 6);
          } else if (cell === 3) { // Bomb powerup
            ctx.fillStyle = "#ff6600";
            ctx.beginPath();
            ctx.arc(cx + CELL / 2, cy + CELL / 2, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#000";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText("💣", cx + CELL / 2, cy + CELL / 2 + 5);
          } else if (cell === 4) { // Flame powerup
            ctx.fillStyle = "#ff0000";
            ctx.beginPath();
            ctx.arc(cx + CELL / 2, cy + CELL / 2, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText("🔥", cx + CELL / 2, cy + CELL / 2 + 5);
          } else if (cell === 5) { // Speed powerup
            ctx.fillStyle = "#00ff00";
            ctx.beginPath();
            ctx.arc(cx + CELL / 2, cy + CELL / 2, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#000";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            ctx.fillText("⚡", cx + CELL / 2, cy + CELL / 2 + 5);
          } else {
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(cx, cy, CELL, CELL);
          }
        }
      }

      // Draw bombs
      game.bombs.forEach(bomb => {
        const bx = bomb.x * CELL + CELL / 2;
        const by = bomb.y * CELL + CELL / 2;
        const pulse = Math.sin(game.frame * 0.2) * 3;

        ctx.fillStyle = "#222";
        ctx.shadowColor = bomb.timer < 30 ? "#ff0000" : "#ff6600";
        ctx.shadowBlur = 10 + pulse;
        ctx.beginPath();
        ctx.arc(bx, by, 12 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Fuse
        ctx.strokeStyle = "#ff6600";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx, by - 12);
        ctx.lineTo(bx + 5, by - 18);
        ctx.stroke();

        ctx.shadowBlur = 0;
      });

      // Draw explosions
      game.explosions.forEach(exp => {
        const alpha = exp.timer / 30;
        ctx.fillStyle = `rgba(255, ${Math.floor(100 * alpha)}, 0, ${alpha})`;
        ctx.shadowColor = "#ff4400";
        ctx.shadowBlur = 20;

        // Center
        ctx.beginPath();
        ctx.arc(exp.x * CELL + CELL / 2, exp.y * CELL + CELL / 2, 14, 0, Math.PI * 2);
        ctx.fill();

        // Rays
        for (const dir of exp.directions) {
          for (let i = 1; i <= dir.length; i++) {
            const ex = (exp.x + dir.dx * i) * CELL + CELL / 2;
            const ey = (exp.y + dir.dy * i) * CELL + CELL / 2;
            ctx.beginPath();
            ctx.arc(ex, ey, 12, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.shadowBlur = 0;
      });

      // Draw enemies
      game.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const ex = enemy.x * CELL + CELL / 2;
        const ey = enemy.y * CELL + CELL / 2;

        ctx.fillStyle = "#ff4444";
        ctx.shadowColor = "#ff4444";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ex, ey, 12, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(ex - 4, ey - 3, 3, 0, Math.PI * 2);
        ctx.arc(ex + 4, ey - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(ex - 4, ey - 3, 1.5, 0, Math.PI * 2);
        ctx.arc(ex + 4, ey - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw player
      const player = game.player;
      if (game.invulnerable <= 0 || Math.floor(game.invulnerable / 4) % 2 === 0) {
        const px = player.x * CELL + CELL / 2;
        const py = player.y * CELL + CELL / 2;

        ctx.fillStyle = accentColor;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();

        // Robot face
        ctx.fillStyle = "#000";
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(px - 4, py - 3, 3, 0, Math.PI * 2);
        ctx.arc(px + 4, py - 3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - 5, py + 5);
        ctx.lineTo(px + 5, py + 5);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // UI
      ctx.fillStyle = accentColor;
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${score}`, 10, 25);
      ctx.textAlign = "center";
      ctx.fillText(`LEVEL ${level}`, CANVAS_WIDTH / 2, 25);
      ctx.textAlign = "right";
      ctx.fillText("🤖".repeat(lives), CANVAS_WIDTH - 10, 25);

      // Powerup status
      ctx.font = "12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`💣×${game.player.maxBombs} 🔥×${game.player.bombRange}`, 10, CANVAS_HEIGHT - 10);

      // Overlays
      if (gameState !== "playing") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.textAlign = "center";

        if (gameState === "gameover") {
          ctx.fillStyle = "#ff4444";
          ctx.font = "bold 36px monospace";
          ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
          ctx.fillStyle = accentColor;
          ctx.font = "20px monospace";
          ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
          ctx.font = "14px monospace";
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fillText("Press SPACE to retry", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
        } else if (gameState === "levelcomplete") {
          ctx.fillStyle = "#00ff00";
          ctx.font = "bold 32px monospace";
          ctx.fillText("LEVEL COMPLETE!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
          ctx.fillStyle = accentColor;
          ctx.font = "14px monospace";
          ctx.fillText("Press SPACE for next level", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        } else {
          ctx.fillStyle = accentColor;
          ctx.font = "bold 32px monospace";
          ctx.fillText("ROBO-BOMBER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 70);
          ctx.font = "14px monospace";
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.fillText("Blast enemy robots with bombs!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillText("Arrows/WASD: Move  SPACE: Place Bomb", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
          ctx.fillText("💣 More bombs  🔥 Longer range  ⚡ Speed", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
          ctx.fillStyle = accentColor;
          ctx.fillText("Press SPACE to start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, score, lives, level, initGame]);

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
