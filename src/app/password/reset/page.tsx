import Link from "next/link";
import { PasswordResetForm } from "@/components/password-reset-form";

export default function PasswordResetPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4">
      <section className="w-full rounded-md border border-ink/10 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black">비밀번호 재설정</h1>
        <p className="mt-2 text-sm text-ink/60">계정 이메일로 재설정 절차를 시작합니다.</p>
        <div className="mt-6">
          <PasswordResetForm />
        </div>
        <p className="mt-4 text-center text-sm text-ink/60">
          기억났나요?{" "}
          <Link className="font-bold text-leaf hover:text-ink" href="/login">
            로그인
          </Link>
        </p>
      </section>
    </main>
  );
}
