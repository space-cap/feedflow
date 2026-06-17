import { Bell, Compass, Home, LogIn, Settings } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/demo-session";

export async function MobileNav() {
  const viewer = await getSessionUser();
  const accountHref = viewer ? "/settings" : "/login";
  const accountLabel = viewer ? "설정" : "로그인";
  const AccountIcon = viewer ? Settings : LogIn;

  const items = [
    { href: "/", label: "홈", icon: Home },
    { href: "/explore", label: "탐색", icon: Compass },
    { href: "/notifications", label: "알림", icon: Bell },
    { href: accountHref, label: accountLabel, icon: AccountIcon }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/95 px-3 py-2 shadow-[0_-8px_24px_rgba(23,33,27,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => (
          <Link
            className="flex h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-bold text-ink/60 transition hover:bg-mist hover:text-leaf"
            href={item.href}
            key={item.label}
            title={item.label}
          >
            <item.icon aria-hidden="true" className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
