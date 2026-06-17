"use client";

import { RotateCcw } from "lucide-react";

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4">
      <section className="rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-black">화면을 불러오지 못했습니다</h1>
        <p className="mt-2 text-sm text-ink/60">{error.message || "잠시 후 다시 시도해 주세요."}</p>
        <button
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 font-bold text-white transition hover:bg-leaf"
          onClick={reset}
          type="button"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          <span>다시 시도</span>
        </button>
      </section>
    </main>
  );
}
