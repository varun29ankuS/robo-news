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

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function getDomainUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch {
    return "";
  }
}

interface PreviewStackProps {
  posts: Post[];
  activeId: number | null;
  onVisit: (post: Post) => void;
  onRemove: (postId: number) => void;
  onSelect: (postId: number) => void;
}

export default function PreviewStack({ posts, activeId, onVisit, onRemove, onSelect }: PreviewStackProps) {
  if (posts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
          <svg width="80" height="80" viewBox="0 0 24 24" className="robot-icon relative opacity-40">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" className="fill-[var(--accent)]" />
            <circle cx="15" cy="10" r="1.5" fill="currentColor" className="fill-[var(--accent)]" />
            <path d="M8 15h8" />
          </svg>
        </div>
        <p className="text-[var(--text-secondary)] text-sm mb-2 font-medium">Your reading queue is empty</p>
        <p className="text-[var(--text-muted)] text-xs">Click articles to add them here</p>
        <div className="mt-6 flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <kbd className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-[10px]">Click</kbd>
          <span>to preview</span>
          <kbd className="px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded text-[10px] ml-2">Double-click</kbd>
          <span>to visit</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-[0.65rem] text-[var(--accent)] uppercase tracking-[0.2em]">
          Reading Queue ({posts.length})
        </span>
        <button
          onClick={() => posts.forEach(p => onRemove(p.id))}
          className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors uppercase tracking-wider"
        >
          Clear All
        </button>
      </div>

      {posts.map((post, index) => {
        const DomainIcon = domainIconMap[post.domain] || AllIcon;
        const isActive = activeId === post.id;

        return (
          <article
            key={post.id}
            onClick={() => onSelect(post.id)}
            className={`
              preview-card relative p-4 cursor-pointer transition-all duration-300
              ${isActive ? "preview-card-active" : "preview-card-inactive"}
            `}
            style={{
              transform: isActive ? "scale(1)" : `scale(${1 - index * 0.02})`,
              opacity: isActive ? 1 : 1 - index * 0.15,
              zIndex: posts.length - index,
            }}
          >
            {/* Glow effect for active card */}
            {isActive && (
              <div className="absolute inset-0 bg-[var(--accent)] opacity-5 rounded-lg pointer-events-none" />
            )}

            {/* Header */}
            <div className="flex items-start gap-3 mb-3 relative">
              <div className={`p-2 rounded-lg ${isActive ? "bg-[var(--accent)]" : "bg-[var(--bg-primary)]"} transition-colors`}>
                <DomainIcon size={20} className={isActive ? "!stroke-[var(--bg-primary)]" : ""} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
                    {post.domain}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">•</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{getDomainUrl(post.url)}</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(post.published_at)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(post.id);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" className="robot-icon">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <h3 className={`text-sm font-medium leading-relaxed mb-3 transition-colors ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
              {post.title}
            </h3>

            {/* Description - only show for active */}
            {isActive && post.description && (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4 line-clamp-3">
                {post.description}
              </p>
            )}

            {/* Action button - only show for active */}
            {isActive && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="relative z-10 w-full py-2.5 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg font-medium text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <span>Read Article</span>
                <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
}
