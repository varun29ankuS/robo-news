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

function getSourceDisplay(source: string): string {
  const map: Record<string, string> = {
    ieee: "IEEE Spectrum",
    hackaday: "Hackaday",
    robotreport: "The Robot Report",
    reddit: "Reddit r/robotics",
    "reddit-ros": "Reddit r/ROS",
    robohub: "Robohub",
    ranews: "Robotics & Automation News",
    sciencedaily: "ScienceDaily",
    mit: "MIT News",
    techxplore: "TechXplore",
    robotiq: "Robotiq",
    ur: "Universal Robots",
    aibusiness: "AI Business",
    venturebeat: "VentureBeat",
    dronedj: "DroneDJ",
    dronegirl: "The Drone Girl",
    sparkfun: "SparkFun",
    adafruit: "Adafruit",
    autoworld: "Automation World",
    manufacturer: "The Manufacturer",
    techcrunch: "TechCrunch",
    arstechnica: "Ars Technica",
    openai: "OpenAI",
    "google-ai": "Google AI",
    marktechpost: "MarkTechPost",
    decoder: "The Decoder",
    synced: "Synced",
    ainews: "AI News",
  };
  return map[source] || source;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDomainUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch {
    return "";
  }
}

interface PostPreviewProps {
  post: Post;
  onClose: () => void;
  onVisit: () => void;
}

export default function PostPreview({ post, onClose, onVisit }: PostPreviewProps) {
  const DomainIcon = domainIconMap[post.domain] || AllIcon;

  return (
    <div className="glow-border bg-[var(--bg-card)] p-6 relative">
      {/* Corner decorations */}
      <div className="corner-decoration corner-tl" />
      <div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" />
      <div className="corner-decoration corner-br" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="hex-icon" style={{ width: 44, height: 50 }}>
            <DomainIcon size={26} />
          </div>
          <div>
            <span className="domain-badge">{post.domain}</span>
            <span className="source-badge ml-2">{getSourceDisplay(post.source)}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-[var(--accent)] transition-colors p-1"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" className="robot-icon">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <h2 className="text-lg font-medium mb-4 leading-relaxed">
        {post.title}
      </h2>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-6">
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" className="robot-icon">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatDate(post.published_at)}
        </span>
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" className="robot-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {getDomainUrl(post.url)}
        </span>
      </div>

      {/* Description */}
      {post.description && (
        <div className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          {post.description}
        </div>
      )}

      {/* URL preview */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 rounded mb-6 text-xs">
        <span className="opacity-50">Source:</span>
        <span className="opacity-70 ml-2 break-all">{getDomainUrl(post.url)}</span>
      </div>

      {/* Action button */}
      <button
        onClick={onVisit}
        className="w-full py-3 glow-border bg-[rgba(0,212,255,0.05)] hover:bg-[rgba(0,212,255,0.1)] transition-colors flex items-center justify-center gap-2 text-[var(--accent)] font-medium"
      >
        <span>VISIT ARTICLE</span>
        <svg width="16" height="16" viewBox="0 0 24 24" className="robot-icon">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </button>

      {/* Hint */}
      <p className="text-center text-xs text-gray-600 mt-3">
        Click the card again or press Enter to visit
      </p>
    </div>
  );
}
