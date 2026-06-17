import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4">
      <section className="rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-black">페이지를 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-ink/60">주소가 바뀌었거나 삭제된 화면입니다.</p>
        <Link
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 font-bold text-white transition hover:bg-leaf"
          href="/"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          <span>홈으로</span>
        </Link>
      </section>
    </main>
  );
}
