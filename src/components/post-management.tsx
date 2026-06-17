"use client";

import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type PostManagementProps = {
  postId: string;
  initialContent: string;
};

export function PostManagement({ postId, initialContent }: PostManagementProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"save" | "delete" | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPendingAction("save");

    const response = await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setError(body?.error?.message ?? "게시글을 수정하지 못했습니다.");
      setPendingAction(null);
      return;
    }

    setIsEditing(false);
    setPendingAction(null);
    router.refresh();
  }

  async function remove() {
    setError(null);
    setPendingAction("delete");

    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setError(body?.error?.message ?? "게시글을 삭제하지 못했습니다.");
      setPendingAction(null);
      return;
    }

    setPendingAction(null);
    router.push("/");
    router.refresh();
  }

  if (isEditing) {
    return (
      <form className="mt-4 rounded-md border border-ink/10 bg-mist/50 p-3" onSubmit={save}>
        <label className="sr-only" htmlFor={`edit-${postId}`}>
          게시글 수정
        </label>
        <textarea
          className="min-h-24 w-full resize-none rounded-md border border-ink/10 bg-white p-3 leading-7 outline-none focus:border-leaf"
          id={`edit-${postId}`}
          maxLength={500}
          onChange={(event) => setContent(event.target.value)}
          value={content}
        />
        {error ? <p className="mt-2 text-sm font-bold text-coral">{error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-sm font-bold text-white transition hover:bg-leaf disabled:bg-ink/35"
            disabled={pendingAction !== null}
            type="submit"
          >
            {pendingAction === "save" ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
            <span>저장</span>
          </button>
          <button
            className="flex h-9 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-bold text-ink transition hover:bg-mist"
            onClick={() => {
              setContent(initialContent);
              setIsEditing(false);
              setError(null);
            }}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            <span>취소</span>
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        className="flex h-8 items-center gap-1 rounded-md border border-ink/10 bg-white px-2 text-xs font-bold text-ink transition hover:bg-mist"
        onClick={() => setIsEditing(true)}
        type="button"
      >
        <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
        <span>수정</span>
      </button>
      <button
        className="flex h-8 items-center gap-1 rounded-md border border-ink/10 bg-white px-2 text-xs font-bold text-ink transition hover:bg-[#fff0ed] hover:text-coral disabled:text-ink/35"
        disabled={pendingAction !== null}
        onClick={remove}
        type="button"
      >
        {pendingAction === "delete" ? (
          <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
        )}
        <span>삭제</span>
      </button>
      {error ? <p className="basis-full text-sm font-bold text-coral">{error}</p> : null}
    </div>
  );
}
