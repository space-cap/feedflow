"use client";

import { KeyRound, Loader2, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

export function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsRequesting(true);

    const response = await fetch("/api/auth/password/reset-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const body = (await response.json().catch(() => null)) as {
      data?: { debugToken?: string };
      error?: { message?: string };
    } | null;

    setIsRequesting(false);

    if (!response.ok) {
      setError(body?.error?.message ?? "재설정 요청을 처리하지 못했습니다.");
      return;
    }

    if (body?.data?.debugToken) {
      setToken(body.data.debugToken);
    }

    setMessage("계정이 확인되면 비밀번호 재설정 안내가 발송됩니다.");
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsResetting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: String(formData.get("password") ?? "")
      })
    });
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;

    setIsResetting(false);

    if (!response.ok) {
      setError(body?.error?.message ?? "비밀번호를 변경하지 못했습니다.");
      return;
    }

    setMessage("비밀번호가 변경되었습니다. 새 비밀번호로 로그인할 수 있습니다.");
    setToken("");
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={requestReset}>
        <div>
          <label className="text-sm font-bold" htmlFor="reset-email">
            이메일
          </label>
          <input
            className="mt-1 h-11 w-full rounded-md border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
            id="reset-email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 font-bold text-white transition hover:bg-leaf disabled:cursor-not-allowed disabled:bg-ink/35"
          disabled={isRequesting}
          type="submit"
        >
          {isRequesting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Mail aria-hidden="true" className="h-4 w-4" />}
          <span>재설정 요청</span>
        </button>
      </form>

      <form className="space-y-4 border-t border-ink/10 pt-5" onSubmit={resetPassword}>
        <div>
          <label className="text-sm font-bold" htmlFor="reset-token">
            재설정 토큰
          </label>
          <input
            className="mt-1 h-11 w-full rounded-md border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
            id="reset-token"
            onChange={(event) => setToken(event.target.value)}
            required
            value={token}
          />
        </div>
        <div>
          <label className="text-sm font-bold" htmlFor="new-password">
            새 비밀번호
          </label>
          <input
            className="mt-1 h-11 w-full rounded-md border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
            id="new-password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </div>
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-leaf px-4 font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/35"
          disabled={isResetting}
          type="submit"
        >
          {isResetting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <KeyRound aria-hidden="true" className="h-4 w-4" />}
          <span>비밀번호 변경</span>
        </button>
      </form>

      {message ? <p className="text-sm font-bold text-leaf">{message}</p> : null}
      {error ? <p className="text-sm font-bold text-coral">{error}</p> : null}
    </div>
  );
}
