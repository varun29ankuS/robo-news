"use client";

import type { Post } from "@/lib/db";
import PostCard from "./PostCard";

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p className="text-lg">No posts found</p>
        <p className="text-sm mt-2">Run `bun fetch` to fetch RSS feeds</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
