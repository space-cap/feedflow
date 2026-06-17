"use client";

import { Loader2, Repeat2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";

type RepostButtonProps = {
  postId: string;
  initialReposted: boolean;
  initialCount: number;
};

export function RepostButton({ postId, initialReposted, initialCount }: RepostButtonProps) {
  const router = useRouter();
  const [reposted, setReposted] = useState(initialReposted);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  async function toggleRepost() {
    if (isPending) {
      return;
    }

    const nextReposted = !reposted;
    setReposted(nextReposted);
    setCount((current) => Math.max(0, current + (nextReposted ? 1 : -1)));
    setIsPending(true);

    const response = await fetch(`/api/posts/${postId}/repost`, {
      method: nextReposted ? "POST" : "DELETE"
    });

    if (!response.ok) {
      setReposted(reposted);
      setCount(initialCount);
      setIsPending(false);
      return;
    }

    const body = (await response.json()) as {
      data: {
        reposted: boolean;
        repostCount: number;
      };
    };
    setReposted(body.data.reposted);
    setCount(body.data.repostCount);
    setIsPending(false);
    router.refresh();
  }

  return (
    <button
      aria-pressed={reposted}
      className={clsx(
        "flex h-9 items-center gap-2 rounded-md px-2 text-sm transition hover:bg-mist hover:text-leaf",
        reposted ? "font-bold text-leaf" : "text-ink/60"
      )}
      disabled={isPending}
      onClick={toggleRepost}
      title="재게시"
      type="button"
    >
      {isPending ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : (
        <Repeat2 aria-hidden="true" className="h-4 w-4" />
      )}
      <span>{count}</span>
    </button>
  );
}
