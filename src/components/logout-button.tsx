"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  iconOnly?: boolean;
  variant?: "default" | "compact";
};

export function LogoutButton({ iconOnly = false, variant = "default" }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function logout() {
    setIsPending(true);
    const response = await fetch("/api/auth/logout", { method: "POST" });

    if (!response.ok) {
      setIsPending(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className={
        iconOnly
          ? "grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink shadow-sm transition hover:bg-mist"
          : variant === "compact"
            ? "flex h-9 w-full items-center justify-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-bold text-ink transition hover:bg-mist"
            : "flex h-10 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-bold text-ink shadow-sm transition hover:bg-mist"
      }
      disabled={isPending}
      onClick={logout}
      title="로그아웃"
      type="button"
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      {iconOnly ? null : <span>로그아웃</span>}
    </button>
  );
}
