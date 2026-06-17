"use client";

import { CheckCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReadAllNotificationsButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function markAllRead() {
    setIsPending(true);
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setIsPending(false);
    router.refresh();
  }

  return (
    <button
      className="flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-bold text-ink shadow-sm transition hover:bg-mist disabled:cursor-not-allowed disabled:text-ink/35"
      disabled={isPending}
      onClick={markAllRead}
      type="button"
    >
      {isPending ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCheck aria-hidden="true" className="h-4 w-4" />
      )}
      <span>전체 읽음</span>
    </button>
  );
}
