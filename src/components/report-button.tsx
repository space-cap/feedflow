"use client";

import { Check, Flag, Loader2 } from "lucide-react";
import { useState } from "react";

type ReportButtonProps = {
  targetType: "post" | "user";
  targetId: string;
};

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [reported, setReported] = useState(false);

  async function report() {
    if (isPending || reported) {
      return;
    }

    setIsPending(true);
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        targetType,
        targetId,
        reason: "spam"
      })
    });

    setReported(response.ok);
    setIsPending(false);
  }

  return (
    <button
      className="flex h-9 items-center justify-end gap-2 rounded-md px-2 text-sm text-ink/60 transition hover:bg-[#fff0ed] hover:text-coral disabled:cursor-not-allowed disabled:text-leaf"
      disabled={isPending || reported}
      onClick={report}
      title={reported ? "신고 완료" : "신고"}
      type="button"
    >
      {isPending ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : reported ? (
        <Check aria-hidden="true" className="h-4 w-4" />
      ) : (
        <Flag aria-hidden="true" className="h-4 w-4" />
      )}
    </button>
  );
}
