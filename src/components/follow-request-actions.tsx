"use client";

import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FollowRequestActionsProps = {
  requestId: string;
};

export function FollowRequestActions({ requestId }: FollowRequestActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setPendingAction(action);
    await fetch(`/api/follow-requests/${requestId}/${action}`, { method: "POST" });
    setPendingAction(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        className="flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-bold text-white transition hover:bg-leaf disabled:bg-ink/35"
        disabled={pendingAction !== null}
        onClick={() => act("approve")}
        type="button"
      >
        {pendingAction === "approve" ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <Check aria-hidden="true" className="h-4 w-4" />
        )}
        <span>승인</span>
      </button>
      <button
        className="flex h-9 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-bold text-ink transition hover:bg-[#fff0ed] hover:text-coral disabled:text-ink/35"
        disabled={pendingAction !== null}
        onClick={() => act("reject")}
        type="button"
      >
        {pendingAction === "reject" ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <X aria-hidden="true" className="h-4 w-4" />
        )}
        <span>거절</span>
      </button>
    </div>
  );
}
