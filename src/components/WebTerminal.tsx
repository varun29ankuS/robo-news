"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Post } from "@/lib/db";

const DOMAINS = ["all", "ai", "drones", "arms", "humanoids", "mobile", "industrial", "diy"] as const;
type Domain = (typeof DOMAINS)[number];

const DOMAIN_ICONS: Record<Domain, string> = {
  all: "◈", ai: "◉", drones: "◇", arms: "⬡",
  humanoids: "◎", mobile: "◐", industrial: "⬢", diy: "✦",
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getSourceDisplay(source: string): string {
  const map: Record<string, string> = {
    ieee: "IEEE Spectrum", hackaday: "Hackaday", robotreport: "The Robot Report",
    reddit: "Reddit", robohub: "Robohub", techcrunch: "TechCrunch",
    openai: "OpenAI", marktechpost: "MarkTechPost", mit: "MIT News",
    venturebeat: "VentureBeat", wired: "WIRED", arstechnica: "Ars Technica",
  };
  return map[source] || source;
}

interface WebTerminalProps {
  posts: Post[];
}

export default function WebTerminal({ posts }: WebTerminalProps) {
  const [domain, setDomain] = useState<Domain>("all");
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<Array<{ text: string; type: "input" | "output" | "error" | "success" | "header" | "info" }>>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredPosts = domain === "all" ? posts : posts.filter(p => p.domain === domain);

  const addLine = useCallback((text: string, type: "input" | "output" | "error" | "success" | "header" | "info" = "output") => {
    setHistory(prev => [...prev, { text, type }]);
  }, []);

  const typeText = useCallback(async (lines: string[], type: "output" | "header" | "info" = "output") => {
    setIsTyping(true);
    for (const line of lines) {
      addLine(line, type);
      await new Promise(r => setTimeout(r, 30));
    }
    setIsTyping(false);
  }, [addLine]);

  const processCommand = useCallback(async (cmd: string) => {
    const parts = cmd.trim().split(/\s+/);
    const mainCmd = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    addLine(`$ ${cmd}`, "input");
    setCmdHistory(prev => [cmd, ...prev.slice(0, 50)]);
    setCmdHistoryIdx(-1);

    if (!mainCmd) return;

    switch (mainCmd) {
      case "help":
        await typeText([
          "",
          "┌──────────────────────────────────────────────────────────────────┐",
          "│                    ROBO-NEWS TERMINAL v2.0                       │",
          "├──────────────────────────────────────────────────────────────────┤",
          "│  NAVIGATION                                                      │",
          "│    list [n]          Show latest n articles (default: 10)        │",
          "│    read <id>         Show full article details                   │",
          "│    open <id>         Open article in browser                     │",
          "│    search <query>    Search articles by keyword                  │",
          "│                                                                  │",
          "│  FILTERING                                                       │",
          "│    domain <name>     Filter by domain (ai/drones/arms/etc)       │",
          "│    domains           List all available domains                  │",
          "│    source <name>     Filter by source                            │",
          "│    sources           List all sources                            │",
          "│                                                                  │",
          "│  STATS & INFO                                                    │",
          "│    stats             Show database statistics                    │",
          "│    trending          Show trending topics                        │",
          "│    latest            Show most recent articles                   │",
          "│    random            Show a random article                       │",
          "│                                                                  │",
          "│  SYSTEM                                                          │",
          "│    clear             Clear terminal                              │",
          "│    theme             Toggle terminal theme                       │",
          "│    about             About ROBO-NEWS                             │",
          "│    whoami            Display current user                        │",
          "│    date              Show current date/time                      │",
          "│    uptime            Show system uptime                          │",
          "│    matrix            Enter the matrix                            │",
          "│    exit              Close terminal (just kidding)               │",
          "│                                                                  │",
          "│  SHORTCUTS: ↑/↓ command history │ Tab autocomplete               │",
          "└──────────────────────────────────────────────────────────────────┘",
          "",
        ], "header");
        break;

      case "clear":
        setHistory([]);
        break;

      case "domains":
        addLine("", "output");
        addLine("┌─ AVAILABLE DOMAINS ─────────────────────────────────┐", "header");
        for (const d of DOMAINS) {
          const icon = DOMAIN_ICONS[d];
          const count = d === "all" ? posts.length : posts.filter(p => p.domain === d).length;
          const active = d === domain ? " ◀ ACTIVE" : "";
          addLine(`│  ${icon} ${d.toUpperCase().padEnd(12)} ${String(count).padStart(4)} articles${active.padEnd(10)}│`, "output");
        }
        addLine("└─────────────────────────────────────────────────────┘", "header");
        addLine("", "output");
        addLine("Usage: domain <name> to switch", "info");
        break;

      case "domain":
        if (args[0] && DOMAINS.includes(args[0] as Domain)) {
          setDomain(args[0] as Domain);
          const count = args[0] === "all" ? posts.length : posts.filter(p => p.domain === args[0]).length;
          addLine(`✓ Switched to ${args[0].toUpperCase()} (${count} articles)`, "success");
        } else {
          addLine(`✗ Invalid domain. Available: ${DOMAINS.join(", ")}`, "error");
        }
        break;

      case "sources":
        const sourceCounts = posts.reduce((acc, p) => {
          acc[p.source] = (acc[p.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const sortedSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);

        addLine("", "output");
        addLine("┌─ NEWS SOURCES ──────────────────────────────────────┐", "header");
        for (const [src, count] of sortedSources.slice(0, 15)) {
          const bar = "█".repeat(Math.min(20, Math.floor(count / 5))) + "░".repeat(Math.max(0, 20 - Math.floor(count / 5)));
          addLine(`│  ${getSourceDisplay(src).padEnd(18)} ${bar} ${count}`, "output");
        }
        addLine("└─────────────────────────────────────────────────────┘", "header");
        break;

      case "list":
        const listCount = parseInt(args[0]) || 10;
        const listPosts = filteredPosts.slice(0, Math.min(listCount, 25));

        addLine("", "output");
        addLine(`┌─ ${domain.toUpperCase()} ARTICLES ─ Showing ${listPosts.length} of ${filteredPosts.length} ${"─".repeat(20)}┐`, "header");
        addLine("│", "output");

        for (let i = 0; i < listPosts.length; i++) {
          const post = listPosts[i];
          const icon = DOMAIN_ICONS[post.domain as Domain] || "◈";
          const title = post.title.length > 55 ? post.title.slice(0, 52) + "..." : post.title;
          addLine(`│  [${String(i + 1).padStart(2, "0")}] ${icon} ${title}`, "output");
          addLine(`│       └─ ${getSourceDisplay(post.source)} • ${timeAgo(post.published_at)}`, "info");
        }

        addLine("│", "output");
        addLine("└─────────────────────────────────────────────────────────────────┘", "header");
        addLine("", "output");
        addLine("Use 'read <id>' for details or 'open <id>' to visit", "info");
        break;

      case "read":
        const readId = parseInt(args[0]) - 1;
        if (readId >= 0 && readId < filteredPosts.length) {
          const post = filteredPosts[readId];
          addLine("", "output");
          addLine("╔════════════════════════════════════════════════════════════════╗", "header");
          addLine(`║ ${DOMAIN_ICONS[post.domain as Domain] || "◈"} ${post.domain.toUpperCase()}`, "header");
          addLine("╠════════════════════════════════════════════════════════════════╣", "header");
          addLine(`║ ${post.title}`, "output");
          addLine("║", "output");
          addLine(`║ Source: ${getSourceDisplay(post.source)}`, "info");
          addLine(`║ Published: ${timeAgo(post.published_at)}`, "info");
          addLine("║", "output");
          if (post.description) {
            const words = post.description.split(" ");
            let line = "║ ";
            for (const word of words) {
              if (line.length + word.length > 65) {
                addLine(line, "output");
                line = "║ " + word + " ";
              } else {
                line += word + " ";
              }
            }
            if (line.length > 2) addLine(line, "output");
          }
          addLine("║", "output");
          addLine(`║ URL: ${post.url.slice(0, 58)}...`, "info");
          addLine("╚════════════════════════════════════════════════════════════════╝", "header");
          addLine("", "output");
          addLine(`Type 'open ${args[0]}' to read full article`, "success");
        } else {
          addLine(`✗ Invalid article ID. Use 1-${filteredPosts.length}`, "error");
        }
        break;

      case "open":
        const openId = parseInt(args[0]) - 1;
        if (openId >= 0 && openId < filteredPosts.length) {
          const post = filteredPosts[openId];
          addLine(`✓ Opening: ${post.title.slice(0, 50)}...`, "success");
          window.open(post.url, "_blank", "noopener,noreferrer");
        } else {
          addLine(`✗ Invalid article ID. Use 1-${filteredPosts.length}`, "error");
        }
        break;

      case "search":
        const query = args.join(" ").toLowerCase();
        if (!query) {
          addLine("✗ Usage: search <keyword>", "error");
          break;
        }
        const results = posts.filter(p =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
        ).slice(0, 10);

        if (results.length === 0) {
          addLine(`✗ No results for "${query}"`, "error");
        } else {
          addLine("", "output");
          addLine(`┌─ SEARCH RESULTS: "${query}" ─ ${results.length} found ${"─".repeat(20)}┐`, "header");
          results.forEach((post, i) => {
            const icon = DOMAIN_ICONS[post.domain as Domain] || "◈";
            addLine(`│  [${String(i + 1).padStart(2, "0")}] ${icon} ${post.title.slice(0, 50)}...`, "output");
          });
          addLine("└──────────────────────────────────────────────────────────────────┘", "header");
        }
        break;

      case "stats":
        const domainStats = DOMAINS.filter(d => d !== "all").map(d => ({
          domain: d,
          count: posts.filter(p => p.domain === d).length,
        })).sort((a, b) => b.count - a.count);

        const totalSources = new Set(posts.map(p => p.source)).size;
        const todayCount = posts.filter(p => {
          const postDate = new Date(p.published_at);
          const today = new Date();
          return postDate.toDateString() === today.toDateString();
        }).length;

        addLine("", "output");
        addLine("┌─ DATABASE STATISTICS ───────────────────────────────┐", "header");
        addLine(`│  Total Articles:     ${String(posts.length).padStart(6)}                      │`, "output");
        addLine(`│  Unique Sources:     ${String(totalSources).padStart(6)}                      │`, "output");
        addLine(`│  Today's Articles:   ${String(todayCount).padStart(6)}                      │`, "output");
        addLine(`│  Current Filter:     ${domain.toUpperCase().padEnd(6)}                      │`, "output");
        addLine("├─────────────────────────────────────────────────────┤", "header");
        addLine("│  ARTICLES BY DOMAIN:                                │", "output");
        for (const { domain: d, count } of domainStats) {
          const pct = Math.round((count / posts.length) * 100);
          const bar = "▓".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
          addLine(`│  ${DOMAIN_ICONS[d]} ${d.padEnd(12)} ${bar} ${String(pct).padStart(3)}%  │`, "output");
        }
        addLine("└─────────────────────────────────────────────────────┘", "header");
        break;

      case "trending":
        const keywords = ["robot", "AI", "drone", "automation", "humanoid", "machine learning", "ROS", "autonomous"];
        addLine("", "output");
        addLine("┌─ TRENDING TOPICS ────────────────────────────────────┐", "header");
        for (const kw of keywords) {
          const count = posts.filter(p => p.title.toLowerCase().includes(kw.toLowerCase())).length;
          if (count > 0) {
            const bar = "█".repeat(Math.min(15, count));
            addLine(`│  #${kw.padEnd(18)} ${bar} ${count}`, "output");
          }
        }
        addLine("└──────────────────────────────────────────────────────┘", "header");
        break;

      case "latest":
        const latest = [...posts].sort((a, b) =>
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        ).slice(0, 5);

        addLine("", "output");
        addLine("┌─ LATEST ARTICLES ────────────────────────────────────┐", "header");
        latest.forEach((post, i) => {
          addLine(`│  ${DOMAIN_ICONS[post.domain as Domain]} ${post.title.slice(0, 50)}...`, "output");
          addLine(`│    └─ ${timeAgo(post.published_at)} • ${getSourceDisplay(post.source)}`, "info");
        });
        addLine("└──────────────────────────────────────────────────────┘", "header");
        break;

      case "random":
        const randomPost = posts[Math.floor(Math.random() * posts.length)];
        if (randomPost) {
          addLine("", "output");
          addLine("┌─ RANDOM ARTICLE ──────────────────────────────────────┐", "header");
          addLine(`│ ${DOMAIN_ICONS[randomPost.domain as Domain]} ${randomPost.title.slice(0, 55)}`, "output");
          addLine(`│ Source: ${getSourceDisplay(randomPost.source)} • ${timeAgo(randomPost.published_at)}`, "info");
          if (randomPost.description) {
            addLine(`│ ${randomPost.description.slice(0, 60)}...`, "output");
          }
          addLine("└────────────────────────────────────────────────────────┘", "header");
          addLine(`URL: ${randomPost.url}`, "info");
        }
        break;

      case "about":
        await typeText([
          "",
          "  ██████╗  ██████╗ ██████╗  ██████╗       ███╗   ██╗███████╗██╗    ██╗███████╗",
          "  ██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗      ████╗  ██║██╔════╝██║    ██║██╔════╝",
          "  ██████╔╝██║   ██║██████╔╝██║   ██║█████╗██╔██╗ ██║█████╗  ██║ █╗ ██║███████╗",
          "  ██╔══██╗██║   ██║██╔══██╗██║   ██║╚════╝██║╚██╗██║██╔══╝  ██║███╗██║╚════██║",
          "  ██║  ██║╚██████╔╝██████╔╝╚██████╔╝      ██║ ╚████║███████╗╚███╔███╔╝███████║",
          "  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝       ╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝ ╚══════╝",
          "",
          "  The front page of robotics.",
          "",
          "  ROBO-NEWS aggregates news from 25+ sources covering:",
          "  • Artificial Intelligence & Machine Learning",
          "  • Drones & UAVs",
          "  • Robotic Arms & Manipulators",
          "  • Humanoid Robots",
          "  • Mobile Robots & AGVs",
          "  • Industrial Automation",
          "  • DIY & Hobbyist Projects",
          "",
          "  Built with Next.js, TypeScript, and SQLite.",
          "  Also available via: npx robo-news",
          "",
        ], "header");
        break;

      case "whoami":
        addLine("robot@robo-news", "success");
        break;

      case "date":
        addLine(new Date().toLocaleString(), "output");
        break;

      case "uptime":
        addLine("System online since the beginning of time.", "output");
        addLine("All systems nominal. Robots are taking over.", "info");
        break;

      case "matrix":
        addLine("", "output");
        for (let i = 0; i < 10; i++) {
          let line = "";
          for (let j = 0; j < 60; j++) {
            line += Math.random() > 0.5 ? String.fromCharCode(0x30A0 + Math.random() * 96) : " ";
          }
          addLine(line, "success");
        }
        addLine("", "output");
        addLine("Wake up, Neo...", "output");
        break;

      case "exit":
        addLine("Nice try. There is no escape.", "error");
        addLine("You are now part of the machine.", "info");
        break;

      case "sudo":
        addLine("🤖 I'm sorry, Dave. I'm afraid I can't do that.", "error");
        break;

      case "ls":
        addLine("articles/  games/  sources/  config.yaml  README.md", "output");
        break;

      case "pwd":
        addLine("/home/robot/robo-news", "output");
        break;

      case "cat":
        if (args[0] === "README.md") {
          addLine("# ROBO-NEWS", "header");
          addLine("The front page of robotics. Type 'help' for commands.", "output");
        } else {
          addLine(`cat: ${args[0] || "?"}: No such file`, "error");
        }
        break;

      default:
        addLine(`✗ Command not found: ${mainCmd}`, "error");
        addLine("Type 'help' for available commands", "info");
    }
  }, [addLine, typeText, domain, filteredPosts, posts]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isTyping) {
      processCommand(command);
      setCommand("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIdx = Math.min(cmdHistoryIdx + 1, cmdHistory.length - 1);
        setCmdHistoryIdx(newIdx);
        setCommand(cmdHistory[newIdx] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cmdHistoryIdx > 0) {
        const newIdx = cmdHistoryIdx - 1;
        setCmdHistoryIdx(newIdx);
        setCommand(cmdHistory[newIdx] || "");
      } else {
        setCmdHistoryIdx(-1);
        setCommand("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const cmds = ["help", "list", "read", "open", "search", "domain", "domains", "source", "sources", "stats", "trending", "latest", "random", "clear", "about", "whoami", "date", "matrix"];
      const match = cmds.find(c => c.startsWith(command.toLowerCase()));
      if (match) setCommand(match);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  }, [command, isTyping, processCommand, cmdHistory, cmdHistoryIdx]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
    typeText([
      "",
      "  ╔═══════════════════════════════════════════════════════════════╗",
      "  ║  ██████╗  ██████╗ ██████╗  ██████╗    ███╗   ██╗███████╗██╗    ██╗███████╗ ║",
      "  ║  ██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗   ████╗  ██║██╔════╝██║    ██║██╔════╝ ║",
      "  ║  ██████╔╝██║   ██║██████╔╝██║   ██║   ██╔██╗ ██║█████╗  ██║ █╗ ██║███████╗ ║",
      "  ║  ██╔══██╗██║   ██║██╔══██╗██║   ██║   ██║╚██╗██║██╔══╝  ██║███╗██║╚════██║ ║",
      "  ║  ██║  ██║╚██████╔╝██████╔╝╚██████╔╝   ██║ ╚████║███████╗╚███╔███╔╝███████║ ║",
      "  ║  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝    ╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝ ╚══════╝ ║",
      "  ╚═══════════════════════════════════════════════════════════════╝",
      "",
      "  ROBOTICS & AI NEWS AGGREGATOR - TERMINAL MODE v2.0",
      `  ${posts.length} articles loaded from ${new Set(posts.map(p => p.source)).size} sources`,
      "",
      "  Type 'help' for commands, 'list' to browse, or 'search <topic>'",
      "",
    ], "header");
  }, []);

  return (
    <div
      className="terminal-container w-full h-[calc(100vh-200px)] min-h-[500px] bg-[#0d0d0d] rounded-lg border border-[var(--border-color)] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(var(--accent-rgb),0.1)]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-[#151515] border-b border-[var(--border-color)]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
        </div>
        <span className="text-xs text-gray-500 font-mono ml-4">robot@robo-news:~</span>
        <span className="text-xs text-[var(--accent)] font-mono">/{domain}</span>
        <span className="ml-auto text-xs text-gray-600 font-mono">{filteredPosts.length} articles</span>
      </div>

      <div ref={terminalRef} className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
        {history.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-all ${
              line.type === "input" ? "text-[var(--accent)]" :
              line.type === "error" ? "text-red-400" :
              line.type === "success" ? "text-green-400" :
              line.type === "header" ? "text-[var(--accent)]" :
              line.type === "info" ? "text-gray-500" :
              "text-gray-300"
            }`}
          >
            {line.text}
          </div>
        ))}

        <div className="flex items-center mt-1 group">
          <span className="text-[var(--accent)]">$ </span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-gray-200 font-mono caret-[var(--accent)]"
            autoComplete="off"
            spellCheck={false}
            disabled={isTyping}
          />
          <span className="w-2 h-5 bg-[var(--accent)] animate-pulse" />
        </div>
      </div>

      <div className="px-4 py-2 bg-[#151515] border-t border-[var(--border-color)] flex items-center gap-2 text-xs overflow-x-auto">
        {["list", "search", "domains", "stats", "trending", "help"].map(cmd => (
          <button
            key={cmd}
            onClick={() => { processCommand(cmd); }}
            className="px-3 py-1 text-gray-500 hover:text-[var(--accent)] hover:bg-[rgba(var(--accent-rgb),0.1)] rounded font-mono transition-colors whitespace-nowrap"
          >
            {cmd}
          </button>
        ))}
        <span className="ml-auto text-gray-600 hidden sm:block">↑↓ history │ Tab complete │ Ctrl+L clear</span>
      </div>
    </div>
  );
}
