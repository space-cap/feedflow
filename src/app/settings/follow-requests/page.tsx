import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FollowRequestActions } from "@/components/follow-request-actions";
import { getSessionUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FollowRequestsPage() {
  const viewer = await getSessionUser();

  if (!viewer) {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4">
        <section className="rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-black">로그인이 필요합니다</h1>
          <Link
            className="mt-5 inline-flex h-10 items-center rounded-md bg-ink px-4 font-bold text-white transition hover:bg-leaf"
            href="/login"
          >
            로그인
          </Link>
        </section>
      </main>
    );
  }

  const requests = await prisma.follow.findMany({
    where: {
      followingId: viewer.id,
      status: "pending"
    },
    include: {
      follower: {
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
            <h1 className="text-2xl font-black tracking-normal">팔로우 요청</h1>
            <p className="text-sm text-ink/60">{requests.length}개</p>
          </div>
        </div>
      </header>
      <div className="space-y-3 py-4">
        {requests.length === 0 ? (
          <div className="rounded-md border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/55">
            대기 중인 팔로우 요청이 없습니다.
          </div>
        ) : (
          requests.map((request) => (
            <article
              className="flex flex-wrap items-start justify-between gap-4 rounded-md border border-ink/10 bg-white p-4 shadow-sm"
              key={request.id}
            >
              <div>
                <Link className="font-black transition hover:text-leaf" href={`/users/${request.follower.handle}`}>
                  {request.follower.displayName}
                </Link>
                <p className="text-sm text-ink/55">@{request.follower.handle}</p>
                {request.follower.bio ? <p className="mt-2 text-sm text-ink/65">{request.follower.bio}</p> : null}
              </div>
              <FollowRequestActions requestId={request.id} />
            </article>
          ))
        )}
      </div>
    </main>
  );
}
