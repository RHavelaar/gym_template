"use client";

import { Heart, Flame, Trophy } from "lucide-react";
import { useState } from "react";
import type { Post } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isBodyProgressPost, ProgressCelebrationPost } from "@/components/social/progress-celebration-post";

type FeedPostProps = {
  post: Post;
  authorName: string;
};

const reactions = [
  { key: "pump_up", label: "Pump up", icon: Flame },
  { key: "respect", label: "Respect", icon: Trophy },
  { key: "beast_mode", label: "Beast mode", icon: Heart },
] as const;

export const FeedPost = ({ post, authorName }: FeedPostProps) => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const handleReaction = (key: string) => {
    setCounts((c) => ({ ...c, [key]: (c[key] ?? 0) + 1 }));
  };

  if (isBodyProgressPost(post)) {
    return (
      <div className="space-y-4">
        <ProgressCelebrationPost post={post} authorName={authorName} metadata={post.metadata} />
        <div className="flex flex-wrap gap-2 px-1">
          {reactions.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`${label} this post`}
              onClick={() => handleReaction(key)}
            >
              <Icon size={16} className="mr-1" />
              {label}
              {(counts[key] ?? 0) > 0 && <span className="ml-1 text-(--gym-accent)">{counts[key]}</span>}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold">{authorName}</p>
          <p className="text-xs text-(--gym-muted)">{formatDate(post.created_at)}</p>
        </div>
        <span className="rounded bg-white/10 px-2 py-1 text-xs uppercase">{post.post_type}</span>
      </div>
      <p className="mt-3 text-neutral-200">{post.content}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {reactions.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`${label} this post`}
            onClick={() => handleReaction(key)}
          >
            <Icon size={16} className="mr-1" />
            {label}
            {(counts[key] ?? 0) > 0 && <span className="ml-1 text-(--gym-accent)">{counts[key]}</span>}
          </Button>
        ))}
      </div>
    </Card>
  );
};
