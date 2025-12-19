#!/usr/bin/env node
import * as readline from "readline";
import { getPosts, getPostCount, type Post } from "../lib/db.js";

const DOMAINS = ["all", "ai", "drones", "arms", "humanoids", "mobile", "industrial", "diy"] as const;
type Domain = (typeof DOMAINS)[number];

// ANSI escape codes for styling
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
  white: "\x1b[37m",
  bgCyan: "\x1b[46m",
  bgBlack: "\x1b[40m",
  clear: "\x1b[2J\x1b[H",
  hideCursor: "\x1b[?25l",
  showCursor: "\x1b[?25h",
};

const DOMAIN_ICONS: Record<Domain, string> = {
  all: "◈",
  ai: "◉",
  drones: "◇",
  arms: "⬡",
  humanoids: "◎",
  mobile: "◐",
  industrial: "⬢",
  diy: "✦",
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

function getSourceDisplay(source: string): string {
  const map: Record<string, string> = {
    ieee: "IEEE",
    hackaday: "HACKADAY",
    robotreport: "ROBOT REPORT",
    reddit: "REDDIT",
    "reddit-ros": "R/ROS",
    robohub: "ROBOHUB",
    techcrunch: "TECHCRUNCH",
    wired: "WIRED",
    openai: "OPENAI",
    "google-ai": "GOOGLE AI",
    marktechpost: "MARKTECHPOST",
    decoder: "DECODER",
    venturebeat: "VENTUREBEAT",
    mit: "MIT",
  };
  return map[source] || source.toUpperCase().slice(0, 12);
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len - 3) + "...";
}

class RoboNewsTUI {
  private domain: Domain = "all";
  private posts: Post[] = [];
  private selectedIndex = 0;
  private count = 0;
  private message = "";
  private pageSize = 15;
  private pageOffset = 0;

  constructor() {
    this.setupInput();
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadPosts();
    this.render();
  }

  private setupInput(): void {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    process.stdout.write(c.hideCursor);

    process.stdin.on("keypress", async (str, key) => {
      if (key.ctrl && key.name === "c") {
        this.exit();
        return;
      }

      switch (key.name) {
        case "q":
          this.exit();
          break;
        case "up":
        case "k":
          this.moveSelection(-1);
          this.render();
          break;
        case "down":
        case "j":
          this.moveSelection(1);
          this.render();
          break;
        case "left":
        case "h":
          await this.changeDomain(-1);
          break;
        case "right":
        case "l":
          await this.changeDomain(1);
          break;
        case "return":
          await this.openArticle();
          break;
        case "r":
          await this.refresh();
          break;
        case "pageup":
          this.moveSelection(-this.pageSize);
          this.render();
          break;
        case "pagedown":
          this.moveSelection(this.pageSize);
          this.render();
          break;
        default:
          // Number keys for domain selection
          if (str && str >= "1" && str <= "8") {
            const idx = parseInt(str) - 1;
            if (idx < DOMAINS.length) {
              this.domain = DOMAINS[idx];
              await this.loadPosts();
              this.render();
            }
          }
      }
    });
  }

  private async loadPosts(): Promise<void> {
    try {
      const domainFilter = this.domain === "all" ? undefined : this.domain;
      this.posts = await getPosts(domainFilter, 100);
      this.count = await getPostCount(domainFilter);
      this.selectedIndex = 0;
      this.pageOffset = 0;
    } catch (err) {
      this.message = "Error loading posts. Check POSTGRES_URL env var.";
    }
  }

  private moveSelection(delta: number): void {
    this.selectedIndex = Math.max(0, Math.min(this.posts.length - 1, this.selectedIndex + delta));

    // Adjust page offset to keep selection visible
    if (this.selectedIndex < this.pageOffset) {
      this.pageOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.pageOffset + this.pageSize) {
      this.pageOffset = this.selectedIndex - this.pageSize + 1;
    }
  }

  private async changeDomain(delta: number): Promise<void> {
    const currentIdx = DOMAINS.indexOf(this.domain);
    let newIdx = currentIdx + delta;
    if (newIdx < 0) newIdx = DOMAINS.length - 1;
    if (newIdx >= DOMAINS.length) newIdx = 0;
    this.domain = DOMAINS[newIdx];
    await this.loadPosts();
    this.render();
  }

  private async openArticle(): Promise<void> {
    const post = this.posts[this.selectedIndex];
    if (!post) return;

    this.message = `Opening: ${truncate(post.title, 40)}`;
    this.render();

    try {
      const open = await import("open");
      await open.default(post.url);
    } catch {
      // Fallback for systems without 'open'
      console.log(`\n${c.cyan}URL: ${c.white}${post.url}${c.reset}`);
    }

    setTimeout(() => {
      this.message = "";
      this.render();
    }, 2000);
  }

  private async refresh(): Promise<void> {
    await this.loadPosts();
    this.message = "Refreshed!";
    this.render();
    setTimeout(() => {
      this.message = "";
      this.render();
    }, 1500);
  }

  private exit(): void {
    process.stdout.write(c.showCursor);
    process.stdout.write(c.clear);
    console.log(`${c.cyan}Thanks for using ROBO-NEWS!${c.reset}`);
    process.exit(0);
  }

  private renderHeader(): string {
    const logo = `
${c.cyan}${c.bold}  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║  ██████╗  ██████╗ ██████╗  ██████╗       ███╗   ██╗███████╗██╗    ██╗███████╗  ║
  ║  ██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗      ████╗  ██║██╔════╝██║    ██║██╔════╝  ║
  ║  ██████╔╝██║   ██║██████╔╝██║   ██║█████╗██╔██╗ ██║█████╗  ██║ █╗ ██║███████╗  ║
  ║  ██╔══██╗██║   ██║██╔══██╗██║   ██║╚════╝██║╚██╗██║██╔══╝  ██║███╗██║╚════██║  ║
  ║  ██║  ██║╚██████╔╝██████╔╝╚██████╔╝      ██║ ╚████║███████╗╚███╔███╔╝███████║  ║
  ║  ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝       ╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝ ╚══════╝  ║
  ╚═══════════════════════════════════════════════════════════════════════════╝${c.reset}`;

    const stats = `  ${c.gray}Domain: ${c.cyan}${c.bold}${this.domain.toUpperCase()}${c.reset}${c.gray} │ Articles: ${c.cyan}${c.bold}${this.count}${c.reset}${c.gray} │ Robotics & AI News Aggregator${c.reset}`;

    return logo + "\n" + stats;
  }

  private renderDomainTabs(): string {
    const tabs = DOMAINS.map((d, i) => {
      const isActive = d === this.domain;
      const icon = DOMAIN_ICONS[d];
      if (isActive) {
        return `${c.bgCyan}${c.bold} [${i + 1}] ${icon} ${d.toUpperCase()} ${c.reset}`;
      }
      return `${c.gray} [${i + 1}] ${icon} ${d} ${c.reset}`;
    }).join("");

    return `\n  ${tabs}\n`;
  }

  private renderPost(post: Post, index: number, isSelected: boolean): string {
    const icon = DOMAIN_ICONS[post.domain as Domain] || "◈";
    const idx = String(index + 1).padStart(2, "0");
    const title = truncate(post.title, 68);
    const source = getSourceDisplay(post.source).padEnd(14);
    const domain = post.domain.padEnd(10);
    const time = timeAgo(post.published_at);

    const selector = isSelected ? `${c.cyan}▶${c.reset}` : " ";
    const titleColor = isSelected ? `${c.cyan}${c.bold}` : c.white;
    const idxColor = isSelected ? c.cyan : c.gray;

    let line = `  ${selector} ${idxColor}${idx}${c.reset} ${titleColor}${icon} ${title}${c.reset}`;
    line += `\n      ${c.magenta}${source}${c.reset}${c.gray}│${c.reset} ${c.yellow}${domain}${c.reset}${c.gray}│${c.reset} ${c.dim}${time}${c.reset}`;

    if (isSelected && post.description) {
      const desc = truncate(post.description, 80);
      line += `\n      ${c.dim}${desc}${c.reset}`;
    }

    return line;
  }

  private renderPosts(): string {
    if (this.posts.length === 0) {
      return `
  ${c.yellow}╔════════════════════════════════════════╗
  ║         No posts found.                ║
  ║  Run 'npm run fetch' to get articles.  ║
  ╚════════════════════════════════════════╝${c.reset}`;
    }

    const visiblePosts = this.posts.slice(this.pageOffset, this.pageOffset + this.pageSize);
    const lines = visiblePosts.map((post, i) => {
      const actualIndex = this.pageOffset + i;
      return this.renderPost(post, actualIndex, actualIndex === this.selectedIndex);
    });

    const border = `${c.gray}═══════════════════════════════════════════════════════════════════════════════${c.reset}`;

    return `\n  ${border}\n${lines.join("\n  " + c.gray + "─".repeat(75) + c.reset + "\n")}\n  ${border}`;
  }

  private renderHelpBar(): string {
    return `
  ${c.gray}┌─────────────────────────────────────────────────────────────────────────────┐${c.reset}
  ${c.gray}│${c.reset} ${c.cyan}↑/↓ k/j${c.reset} Navigate  ${c.cyan}←/→ h/l${c.reset} Domains  ${c.cyan}Enter${c.reset} Open  ${c.cyan}1-8${c.reset} Jump  ${c.cyan}r${c.reset} Refresh  ${c.cyan}q${c.reset} Quit ${c.gray}│${c.reset}
  ${c.gray}└─────────────────────────────────────────────────────────────────────────────┘${c.reset}`;
  }

  private renderStatusBar(): string {
    const status = `  ${c.dim}Showing ${this.pageOffset + 1}-${Math.min(this.pageOffset + this.pageSize, this.posts.length)} of ${this.count} articles${c.reset}`;
    const msg = this.message ? `  ${c.green}${this.message}${c.reset}` : "";
    return status + msg;
  }

  private render(): void {
    const termHeight = process.stdout.rows || 40;
    this.pageSize = Math.max(5, termHeight - 20);

    const output = [
      c.clear,
      this.renderHeader(),
      this.renderDomainTabs(),
      this.renderPosts(),
      this.renderHelpBar(),
      this.renderStatusBar(),
    ].join("\n");

    process.stdout.write(output);
  }
}

// Start the TUI
new RoboNewsTUI();
