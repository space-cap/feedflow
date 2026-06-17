"use client";

import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FollowButtonProps = {
  userId: string;
  initialStatus: "none" | "pending" | "accepted";
};

export function FollowButton({ userId, initialStatus }: FollowButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isPending, setIsPending] = useState(false);

  async function toggleFollow() {
    if (isPending) {
      return;
    }

    setIsPending(true);
    const response = await fetch(`/api/users/${userId}/follow`, {
      method: status === "accepted" || status === "pending" ? "DELETE" : "POST"
    });

    if (response.ok) {
      const body = (await response.json()) as {
        data: {
          status?: "pending" | "accepted";
          following?: boolean;
        };
      };
      setStatus(body.data.status ?? "none");
      router.refresh();
    }

    setIsPending(false);
  }

  const label = status === "accepted" ? "팔로잉" : status === "pending" ? "요청됨" : "팔로우";

  return (
    <button
      className="flex h-10 items-center gap-2 rounded-md bg-ink px-4 font-bold text-white transition hover:bg-leaf disabled:cursor-not-allowed disabled:bg-ink/35"
      disabled={isPending}
      onClick={toggleFollow}
      type="button"
    >
      {isPending ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : status === "accepted" ? (
        <UserCheck aria-hidden="true" className="h-4 w-4" />
      ) : (
        <UserPlus aria-hidden="true" className="h-4 w-4" />
      )}
      <span>{label}</span>
    </button>
  );
}
