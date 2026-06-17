"use client";

import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";

type LikeButtonProps = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({ postId, initialLiked, initialCount }: LikeButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  async function toggleLike() {
    if (isPending) {
      return;
    }

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)));
    setIsPending(true);

    const response = await fetch(`/api/posts/${postId}/like`, {
      method: nextLiked ? "POST" : "DELETE"
    });

    if (!response.ok) {
      setLiked(liked);
      setCount(initialCount);
      setIsPending(false);
      return;
    }

    const body = (await response.json()) as {
      data: {
        liked: boolean;
        likeCount: number;
      };
    };
    setLiked(body.data.liked);
    setCount(body.data.likeCount);
    setIsPending(false);
    router.refresh();
  }

  return (
    <button
      aria-pressed={liked}
      className={clsx(
        "flex h-9 items-center gap-2 rounded-md px-2 text-sm transition hover:bg-[#fff0ed] hover:text-coral",
        liked ? "font-bold text-coral" : "text-ink/60"
      )}
      disabled={isPending}
      onClick={toggleLike}
      title="좋아요"
      type="button"
    >
      {isPending ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : (
        <Heart aria-hidden="true" className={clsx("h-4 w-4", liked && "fill-current")} />
      )}
      <span>{count}</span>
    </button>
  );
}
