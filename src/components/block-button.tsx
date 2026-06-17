"use client";

import { Ban, Loader2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BlockButtonProps = {
  userId: string;
  initialBlocked: boolean;
};

export function BlockButton({ userId, initialBlocked }: BlockButtonProps) {
  const router = useRouter();
  const [blocked, setBlocked] = useState(initialBlocked);
  const [isPending, setIsPending] = useState(false);

  async function toggleBlock() {
    setIsPending(true);
    const response = await fetch(`/api/users/${userId}/block`, {
      method: blocked ? "DELETE" : "POST"
    });

    if (response.ok) {
      const body = (await response.json()) as { data: { blocked: boolean } };
      setBlocked(body.data.blocked);
      router.refresh();
    }

    setIsPending(false);
  }

  return (
    <button
      className="flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-bold text-ink shadow-sm transition hover:bg-[#fff0ed] hover:text-coral disabled:text-ink/35"
      disabled={isPending}
      onClick={toggleBlock}
      type="button"
    >
      {isPending ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : blocked ? (
        <Undo2 aria-hidden="true" className="h-4 w-4" />
      ) : (
        <Ban aria-hidden="true" className="h-4 w-4" />
      )}
      <span>{blocked ? "차단 해제" : "차단"}</span>
    </button>
  );
}
