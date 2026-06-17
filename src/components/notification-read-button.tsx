"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type NotificationReadButtonProps = {
  notificationId: string;
};

export function NotificationReadButton({ notificationId }: NotificationReadButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function markRead() {
    setIsPending(true);

    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH"
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read.");
      }

      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-ink/10 bg-white text-ink/60 transition hover:border-leaf/30 hover:text-leaf disabled:cursor-wait disabled:opacity-60"
      disabled={isPending}
      onClick={markRead}
      title="읽음 처리"
      type="button"
    >
      <Check aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
