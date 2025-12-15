"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DomainSidebar from "./DomainSidebar";
import PostCard from "./PostCard";
import PreviewStack from "./PreviewStack";
import type { Post } from "@/lib/db";
import type { DomainId } from "@/lib/sources";

interface HomeContentProps {
  initialPosts: Post[];
  initialDomain: string;
  totalCount: number;
}

export default function HomeContent({ initialPosts, initialDomain, totalCount }: HomeContentProps) {
  const router = useRouter();
  const [activeDomain, setActiveDomain] = useState<DomainId>(initialDomain as DomainId);
  const [previewStack, setPreviewStack] = useState<Post[]>([]);
  const [activePreviewId, setActivePreviewId] = useState<number | null>(null);

  const handleDomainChange = (domain: DomainId) => {
    setActiveDomain(domain);
    setPreviewStack([]);
    setActivePreviewId(null);
    const url = domain === "all" ? "/" : `/?domain=${domain}`;
    router.push(url);
  };

  const handlePostSelect = (post: Post) => {
    if (activePreviewId === post.id) {
      window.open(post.url, "_blank", "noopener,noreferrer");
    } else {
      setActivePreviewId(post.id);
      setPreviewStack(prev => {
        const filtered = prev.filter(p => p.id !== post.id);
        return [post, ...filtered].slice(0, 5);
      });
    }
  };

  const handleVisit = useCallback((post: Post) => {
    window.open(post.url, "_blank", "noopener,noreferrer");
  }, []);

  const handleRemoveFromStack = (postId: number) => {
    setPreviewStack(prev => prev.filter(p => p.id !== postId));
    if (activePreviewId === postId) {
      setActivePreviewId(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewStack([]);
        setActivePreviewId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Left Domain Sidebar - Fixed */}
      <aside className="hidden md:block fixed left-0 top-28 w-[200px] bottom-0 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-6 overflow-auto">
        <DomainSidebar active={activeDomain} onChange={handleDomainChange} />

        {/* Stats at bottom */}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
          <div className="px-3 space-y-4">
            <div>
              <div className="text-2xl font-bold text-[var(--accent)]">{totalCount}</div>
              <div className="text-xs opacity-60 uppercase tracking-wider">Articles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--accent)]">25+</div>
              <div className="text-xs opacity-60 uppercase tracking-wider">Sources</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content - with margins for both sidebars */}
      <div className="md:ml-[200px] lg:mr-[590px] px-8">
        {/* Section title */}
        <div className="section-title mb-6">
          <span>{activeDomain === "all" ? "Latest News" : activeDomain}</span>
        </div>

        {/* Posts */}
        {initialPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No posts found</p>
            <p className="text-sm mt-2 font-mono">Run `bun fetch` to fetch RSS feeds</p>
          </div>
        ) : (
          <div className="space-y-3">
            {initialPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                isSelected={activePreviewId === post.id}
                onSelect={() => handlePostSelect(post)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right Preview sidebar - Fixed */}
      <aside className="hidden lg:block fixed right-0 top-28 w-[570px] bottom-0 border-l border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-auto">
        <PreviewStack
          posts={previewStack}
          activeId={activePreviewId}
          onVisit={handleVisit}
          onRemove={handleRemoveFromStack}
          onSelect={(id) => setActivePreviewId(id)}
        />
      </aside>
    </>
  );
}
