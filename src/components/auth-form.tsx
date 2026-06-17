"use client";

import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload =
      mode === "signup"
        ? {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            handle: String(formData.get("handle") ?? ""),
            displayName: String(formData.get("displayName") ?? "")
          }
        : {
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? "")
          };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      setError(body?.error?.message ?? "요청을 처리하지 못했습니다.");
      setIsSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {mode === "signup" ? (
        <>
          <div>
            <label className="text-sm font-bold" htmlFor="displayName">
              표시 이름
            </label>
            <input
              className="mt-1 h-11 w-full rounded-md border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
              id="displayName"
              name="displayName"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold" htmlFor="handle">
              핸들
            </label>
            <input
              className="mt-1 h-11 w-full rounded-md border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
              id="handle"
              name="handle"
              pattern="[A-Za-z0-9_]{3,24}"
              placeholder="feeduser"
              required
            />
          </div>
        </>
      ) : null}
      <div>
        <label className="text-sm font-bold" htmlFor="email">
          이메일
        </label>
        <input
          className="mt-1 h-11 w-full rounded-md border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <label className="text-sm font-bold" htmlFor="password">
          비밀번호
        </label>
        <input
          className="mt-1 h-11 w-full rounded-md border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
          id="password"
          minLength={mode === "signup" ? 8 : undefined}
          name="password"
          required
          type="password"
        />
      </div>
      {error ? <p className="text-sm font-bold text-coral">{error}</p> : null}
      <button
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 font-bold text-white transition hover:bg-leaf disabled:cursor-not-allowed disabled:bg-ink/35"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : mode === "signup" ? (
          <UserPlus aria-hidden="true" className="h-4 w-4" />
        ) : (
          <LogIn aria-hidden="true" className="h-4 w-4" />
        )}
        <span>{mode === "signup" ? "가입하기" : "로그인"}</span>
      </button>
    </form>
  );
}
