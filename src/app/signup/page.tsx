import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4">
      <section className="w-full rounded-md border border-ink/10 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black">회원가입</h1>
        <p className="mt-2 text-sm text-ink/60">짧은 글 피드를 바로 시작합니다.</p>
        <div className="mt-6">
          <AuthForm mode="signup" />
        </div>
        <p className="mt-4 text-center text-sm text-ink/60">
          이미 계정이 있나요?{" "}
          <Link className="font-bold text-leaf hover:text-ink" href="/login">
            로그인
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-ink/60">
          <Link className="font-bold text-ink hover:text-leaf" href="/">
            홈으로 돌아가기
          </Link>
        </p>
      </section>
    </main>
  );
}
