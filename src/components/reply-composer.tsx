"use client";

import { Loader2, SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ReplyComposerProps = {
  postId: string;
};

export function ReplyComposer({ postId }: ReplyComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remaining = 500 - content.length;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (!trimmed) {
      setError("댓글 내용을 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch(`/api/posts/${postId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: trimmed })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setError(body?.error?.message ?? "댓글을 저장하지 못했습니다.");
      setIsSubmitting(false);
      return;
    }

    setContent("");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <form className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="reply-content">
        댓글 내용
      </label>
      <textarea
        className="min-h-24 w-full resize-none rounded-md border border-ink/10 bg-mist/50 p-3 leading-7 outline-none transition focus:border-leaf focus:bg-white"
        id="reply-content"
        maxLength={500}
        onChange={(event) => setContent(event.target.value)}
        placeholder="댓글을 남겨보세요."
        value={content}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-h-5 text-sm">
          {error ? <span className="font-semibold text-coral">{error}</span> : null}
        </div>
        <div className="flex items-center gap-3">
          <span className={remaining < 40 ? "text-sm font-bold text-coral" : "text-sm text-ink/55"}>
            {remaining}
          </span>
          <button
            className="flex h-10 items-center gap-2 rounded-md bg-leaf px-4 font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/25"
            disabled={isSubmitting || !content.trim()}
            type="submit"
          >
            {isSubmitting ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal aria-hidden="true" className="h-4 w-4" />
            )}
            <span>댓글</span>
          </button>
        </div>
      </div>
    </form>
  );
}
