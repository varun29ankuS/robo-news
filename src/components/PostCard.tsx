"use client";

import type { Post } from "@/lib/db";
import {
  DroneIcon,
  ArmIcon,
  HumanoidIcon,
  MobileIcon,
  IndustrialIcon,
  DIYIcon,
  AllIcon,
  AIIcon,
} from "./DomainIcons";

const domainIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ai: AIIcon,
  drones: DroneIcon,
  arms: ArmIcon,
  humanoids: HumanoidIcon,
  mobile: MobileIcon,
  industrial: IndustrialIcon,
  diy: DIYIcon,
  general: AllIcon,
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
    ranews: "R&A NEWS",
    sciencedaily: "SCIENCEDAILY",
    mit: "MIT",
    techxplore: "TECHXPLORE",
    robotiq: "ROBOTIQ",
    ur: "UNIVERSAL ROBOTS",
    aibusiness: "AI BUSINESS",
    venturebeat: "VENTUREBEAT",
    dronedj: "DRONEDJ",
    dronegirl: "DRONE GIRL",
    sparkfun: "SPARKFUN",
    adafruit: "ADAFRUIT",
    autoworld: "AUTO WORLD",
    manufacturer: "MANUFACTURER",
    techcrunch: "TECHCRUNCH",
    wired: "WIRED",
    arstechnica: "ARS TECHNICA",
    openai: "OPENAI",
    "google-ai": "GOOGLE AI",
    marktechpost: "MARKTECHPOST",
    decoder: "THE DECODER",
    synced: "SYNCED",
    ainews: "AI NEWS",
  };
  return map[source] || source.toUpperCase();
}

interface PostCardProps {
  post: Post;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function PostCard({ post, index, isSelected = false, onSelect }: PostCardProps) {
  const DomainIcon = domainIconMap[post.domain] || AllIcon;

  return (
    <article
      className={`group card p-4 cursor-pointer relative overflow-hidden ${isSelected ? "glow-border bg-[rgba(var(--accent-rgb),0.05)]" : ""}`}
      onClick={onSelect ?? undefined}
    >
      {/* Accent line on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isSelected ? "bg-[var(--accent)]" : "bg-transparent group-hover:bg-[var(--accent)] group-hover:opacity-50"}`} />

      <div className="flex items-start gap-4 pl-2">
        {/* Index + Icon stacked */}
        <div className="flex flex-col items-center gap-2">
          <div className="post-index">
            {String(index + 1).padStart(2, "0")}
          </div>
          <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? "bg-[var(--accent)]" : "bg-[var(--bg-primary)]"}`}>
            <DomainIcon size={20} className={isSelected ? "!stroke-[var(--bg-primary)]" : ""} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h2 className={`text-sm font-medium leading-relaxed transition-colors ${isSelected ? "text-[var(--accent)]" : "text-[var(--text-primary)] group-hover:text-[var(--accent)]"}`}>
            {post.title}
          </h2>

          {/* Description snippet */}
          {post.description && (
            <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">
              {post.description.slice(0, 150)}...
            </p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <span className="source-badge">{getSourceDisplay(post.source)}</span>
            <span className="text-[var(--text-muted)] text-xs flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" className="robot-icon opacity-50">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {timeAgo(post.published_at)}
            </span>
          </div>
        </div>

        {/* Add to queue indicator */}
        <div className={`flex-shrink-0 transition-all duration-300 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}>
          <div className="w-8 h-8 rounded-full border border-[var(--accent)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" className="robot-icon">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
}
