"use client";

import { Check, EyeOff, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminReportActionsProps = {
  reportId: string;
  targetType: string;
  targetId: string;
};

export function AdminReportActions({ reportId, targetType, targetId }: AdminReportActionsProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function updateReport(status: "resolved" | "rejected", hidePost = false) {
    setPendingAction(status);

    if (hidePost && targetType === "post") {
      await fetch(`/api/admin/posts/${targetId}/hide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "신고 처리로 숨김" })
      });
    }

    await fetch(`/api/admin/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        note: hidePost ? "게시글 숨김 처리" : "신고 상태 변경"
      })
    });

    setPendingAction(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {targetType === "post" ? (
        <button
          className="flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-bold text-white transition hover:bg-leaf disabled:bg-ink/35"
          disabled={pendingAction !== null}
          onClick={() => updateReport("resolved", true)}
          type="button"
        >
          {pendingAction === "resolved" ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <EyeOff aria-hidden="true" className="h-4 w-4" />
          )}
          <span>숨김 처리</span>
        </button>
      ) : null}
      <button
        className="flex h-9 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-bold text-ink transition hover:bg-mist disabled:text-ink/35"
        disabled={pendingAction !== null}
        onClick={() => updateReport("resolved")}
        type="button"
      >
        <Check aria-hidden="true" className="h-4 w-4" />
        <span>해결</span>
      </button>
      <button
        className="flex h-9 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-bold text-ink transition hover:bg-[#fff0ed] hover:text-coral disabled:text-ink/35"
        disabled={pendingAction !== null}
        onClick={() => updateReport("rejected")}
        type="button"
      >
        <X aria-hidden="true" className="h-4 w-4" />
        <span>기각</span>
      </button>
    </div>
  );
}
