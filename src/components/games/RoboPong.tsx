"use client";

import { useEffect, useRef, useState } from "react";

export default function RoboPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "gameover">("waiting");
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  const gameRef = useRef({
    ballX: 400,
    ballY: 200,
    ballVX: 0,
    ballVY: 0,
    paddle1Y: 160,
    paddle2Y: 160,
    keys: new Set<string>(),
  });

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 80;
  const BALL_SIZE = 10;
  const PADDLE_SPEED = 7;
  const WIN_SCORE = 5;

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    const game = gameRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      game.keys.add(e.key.toLowerCase());

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (gameState === "waiting" || gameState === "gameover") {
          // Start new game
          game.ballX = CANVAS_WIDTH / 2;
          game.ballY = CANVAS_HEIGHT / 2;
          game.ballVX = (Math.random() > 0.5 ? 1 : -1) * 5;
          game.ballVY = (Math.random() - 0.5) * 4;
          game.paddle1Y = 160;
          game.paddle2Y = 160;
          setScore1(0);
          setScore2(0);
          setWinner(null);
          setGameState("playing");
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
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const game = gameRef.current;
    let animationId: number;

    const gameLoop = () => {
      // Get accent color
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#00d4ff";

      // Update game logic only if playing
      if (gameState === "playing") {
        // Move paddles
        if (game.keys.has("w")) game.paddle1Y = Math.max(0, game.paddle1Y - PADDLE_SPEED);
        if (game.keys.has("s")) game.paddle1Y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, game.paddle1Y + PADDLE_SPEED);
        if (game.keys.has("arrowup")) game.paddle2Y = Math.max(0, game.paddle2Y - PADDLE_SPEED);
        if (game.keys.has("arrowdown")) game.paddle2Y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, game.paddle2Y + PADDLE_SPEED);

        // Move ball
        game.ballX += game.ballVX;
        game.ballY += game.ballVY;

        // Ball collision with top/bottom
        if (game.ballY <= 0 || game.ballY >= CANVAS_HEIGHT - BALL_SIZE) {
          game.ballVY = -game.ballVY;
          game.ballY = Math.max(0, Math.min(CANVAS_HEIGHT - BALL_SIZE, game.ballY));
        }

        // Ball collision with left paddle
        if (
          game.ballX <= 30 + PADDLE_WIDTH &&
          game.ballX >= 25 &&
          game.ballY + BALL_SIZE >= game.paddle1Y &&
          game.ballY <= game.paddle1Y + PADDLE_HEIGHT
        ) {
          game.ballVX = Math.abs(game.ballVX) * 1.05;
          game.ballVX = Math.min(game.ballVX, 15);
          const hitPos = (game.ballY + BALL_SIZE / 2 - game.paddle1Y) / PADDLE_HEIGHT - 0.5;
          game.ballVY = hitPos * 8;
          game.ballX = 30 + PADDLE_WIDTH + 1;
        }

        // Ball collision with right paddle
        if (
          game.ballX + BALL_SIZE >= CANVAS_WIDTH - 30 - PADDLE_WIDTH &&
          game.ballX <= CANVAS_WIDTH - 25 &&
          game.ballY + BALL_SIZE >= game.paddle2Y &&
          game.ballY <= game.paddle2Y + PADDLE_HEIGHT
        ) {
          game.ballVX = -Math.abs(game.ballVX) * 1.05;
          game.ballVX = Math.max(game.ballVX, -15);
          const hitPos = (game.ballY + BALL_SIZE / 2 - game.paddle2Y) / PADDLE_HEIGHT - 0.5;
          game.ballVY = hitPos * 8;
          game.ballX = CANVAS_WIDTH - 30 - PADDLE_WIDTH - BALL_SIZE - 1;
        }

        // Scoring
        if (game.ballX < 0) {
          setScore2(prev => {
            const newScore = prev + 1;
            if (newScore >= WIN_SCORE) {
              setWinner(2);
              setGameState("gameover");
            } else {
              // Reset ball
              game.ballX = CANVAS_WIDTH / 2;
              game.ballY = CANVAS_HEIGHT / 2;
              game.ballVX = 5;
              game.ballVY = (Math.random() - 0.5) * 4;
            }
            return newScore;
          });
        }

        if (game.ballX > CANVAS_WIDTH) {
          setScore1(prev => {
            const newScore = prev + 1;
            if (newScore >= WIN_SCORE) {
              setWinner(1);
              setGameState("gameover");
            } else {
              game.ballX = CANVAS_WIDTH / 2;
              game.ballY = CANVAS_HEIGHT / 2;
              game.ballVX = -5;
              game.ballVY = (Math.random() - 0.5) * 4;
            }
            return newScore;
          });
        }
      }

      // Render
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i < CANVAS_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_WIDTH, i);
        ctx.stroke();
      }

      // Center line
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Paddles with glow
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 20;
      ctx.fillStyle = accentColor;

      // Left paddle
      ctx.fillRect(30, game.paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
      // Right paddle
      ctx.fillRect(CANVAS_WIDTH - 30 - PADDLE_WIDTH, game.paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Ball
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(game.ballX + BALL_SIZE / 2, game.ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Scores
      ctx.font = "bold 64px 'Courier New', monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.textAlign = "center";
      ctx.fillText(String(score1), CANVAS_WIDTH / 4, 80);
      ctx.fillText(String(score2), (CANVAS_WIDTH * 3) / 4, 80);

      // Player labels
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillText("P1 [W/S]", CANVAS_WIDTH / 4, CANVAS_HEIGHT - 15);
      ctx.fillText("P2 [↑/↓]", (CANVAS_WIDTH * 3) / 4, CANVAS_HEIGHT - 15);

      // Overlay for waiting/gameover
      if (gameState !== "playing") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = accentColor;
        ctx.font = "bold 36px monospace";
        ctx.textAlign = "center";

        if (gameState === "gameover") {
          ctx.fillText(`PLAYER ${winner} WINS!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
          ctx.font = "18px monospace";
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.fillText(`${score1} - ${score2}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
          ctx.fillText("Press SPACE for rematch", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
        } else {
          ctx.fillText("ROBO-PONG", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);
          ctx.font = "16px monospace";
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.fillText("First to 5 wins!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.fillText("Player 1: W/S    Player 2: ↑/↓", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
          ctx.fillStyle = accentColor;
          ctx.fillText("Press SPACE to start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 65);
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationId);
  }, [gameState, score1, score2, winner]);

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
