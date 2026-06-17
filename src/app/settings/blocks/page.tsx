import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BlockButton } from "@/components/block-button";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlocksSettingsPage() {
  const viewer = await getDemoUser();
  const blocks = await prisma.block.findMany({
    where: {
      blockerId: viewer.id
    },
    include: {
      blocked: {
        select: {
          id: true,
          handle: true,
          displayName: true,
          bio: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

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
            <h1 className="text-2xl font-black tracking-normal">차단 목록</h1>
            <p className="text-sm text-ink/60">{blocks.length}명</p>
          </div>
        </div>
      </header>
      <div className="space-y-3 py-4">
        {blocks.length === 0 ? (
          <div className="rounded-md border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/55">
            차단한 사용자가 없습니다.
          </div>
        ) : (
          blocks.map((block) => (
            <article
              className="flex items-start justify-between gap-4 rounded-md border border-ink/10 bg-white p-4 shadow-sm"
              key={block.id}
            >
              <div>
                <Link className="font-black transition hover:text-leaf" href={`/users/${block.blocked.handle}`}>
                  {block.blocked.displayName}
                </Link>
                <p className="text-sm text-ink/55">@{block.blocked.handle}</p>
                {block.blocked.bio ? <p className="mt-2 text-sm text-ink/65">{block.blocked.bio}</p> : null}
              </div>
              <BlockButton initialBlocked userId={block.blocked.id} />
            </article>
          ))
        )}
      </div>
    </main>
  );
}
