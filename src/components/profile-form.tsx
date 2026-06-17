"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ProfileFormProps = {
  user: {
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    isPrivate: boolean;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: String(formData.get("displayName") ?? ""),
        bio: String(formData.get("bio") ?? ""),
        avatarUrl: String(formData.get("avatarUrl") ?? ""),
        isPrivate: formData.get("isPrivate") === "on"
      })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setError(body?.error?.message ?? "프로필을 저장하지 못했습니다.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form className="space-y-4 rounded-md border border-ink/10 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-bold" htmlFor="displayName">
          표시 이름
        </label>
        <input
          className="mt-1 h-11 w-full rounded-md border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
          defaultValue={user.displayName}
          id="displayName"
          name="displayName"
          required
        />
      </div>
      <div>
        <label className="text-sm font-bold" htmlFor="bio">
          소개
        </label>
        <textarea
          className="mt-1 min-h-28 w-full resize-none rounded-md border border-ink/10 bg-white p-3 outline-none focus:border-leaf"
          defaultValue={user.bio ?? ""}
          id="bio"
          maxLength={160}
          name="bio"
        />
      </div>
      <div>
        <label className="text-sm font-bold" htmlFor="avatarUrl">
          프로필 이미지 URL
        </label>
        <input
          className="mt-1 h-11 w-full rounded-md border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
          defaultValue={user.avatarUrl ?? ""}
          id="avatarUrl"
          name="avatarUrl"
          type="url"
        />
      </div>
      <label className="flex items-center gap-3 rounded-md border border-ink/10 p-3 text-sm font-bold">
        <input defaultChecked={user.isPrivate} name="isPrivate" type="checkbox" />
        <span>비공개 계정</span>
      </label>
      {error ? <p className="text-sm font-bold text-coral">{error}</p> : null}
      <button
        className="flex h-11 items-center gap-2 rounded-md bg-ink px-4 font-bold text-white transition hover:bg-leaf disabled:bg-ink/35"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <Save aria-hidden="true" className="h-4 w-4" />
        )}
        <span>저장</span>
      </button>
    </form>
  );
}
