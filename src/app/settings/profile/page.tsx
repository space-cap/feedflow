import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";
import { getDemoUser } from "@/lib/demo-session";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  const user = await getDemoUser();

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-4 sm:px-6">
      <header className="sticky top-0 z-10 -mx-4 border-b border-ink/10 bg-[#f7faf7]/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            className="grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink shadow-sm transition hover:bg-mist"
            href="/settings"
            title="설정으로"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-normal">프로필 편집</h1>
            <p className="text-sm text-ink/60">@{user.handle}</p>
          </div>
        </div>
      </header>
      <div className="py-4">
        <ProfileForm user={user} />
      </div>
    </main>
  );
}
