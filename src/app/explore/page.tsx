import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ExplorePageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

async function getExploreResults(query: string, viewerId: string) {
  const [posts, users] = await Promise.all([
    prisma.post.findMany({
      where: {
        deletedAt: null,
        isHidden: false,
        parentPostId: null,
        visibility: "public",
        ...(query ? { content: { contains: query } } : {})
      },
      include: {
        author: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            bio: true
          }
        },
        likes: {
          where: { userId: viewerId },
          select: { id: true }
        },
        reposts: {
          where: { userId: viewerId },
          select: { id: true }
        }
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 20
    }),
    prisma.user.findMany({
      where: {
        deletedAt: null,
        status: "active",
        ...(query
          ? {
              OR: [
                { handle: { contains: query.toLowerCase() } },
                { displayName: { contains: query } },
                { bio: { contains: query } }
              ]
            }
          : {})
      },
      select: {
        id: true,
        handle: true,
        displayName: true,
        bio: true
      },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  return { posts, users };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const viewer = await getDemoUser();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = await getExploreResults(query, viewer.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-4 sm:px-6">
      <header className="sticky top-0 z-10 -mx-4 border-b border-ink/10 bg-[#f7faf7]/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            className="grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink shadow-sm transition hover:bg-mist"
            href="/"
            title="홈으로"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-normal">탐색</h1>
            <p className="text-sm text-ink/60">공개 게시글과 사용자 검색</p>
          </div>
        </div>
        <form className="mt-4 flex gap-2" action="/explore">
          <label className="sr-only" htmlFor="q">
            검색어
          </label>
          <input
            className="h-11 min-w-0 flex-1 rounded-md border border-ink/10 bg-white px-3 outline-none focus:border-leaf"
            defaultValue={query}
            id="q"
            name="q"
            placeholder="검색어를 입력하세요"
          />
          <button
            className="grid h-11 w-11 place-items-center rounded-md bg-ink text-white transition hover:bg-leaf"
            title="검색"
            type="submit"
          >
            <Search aria-hidden="true" className="h-5 w-5" />
          </button>
        </form>
      </header>

      <div className="space-y-5 py-4">
        <section>
          <h2 className="mb-3 text-sm font-black text-ink/70">사용자</h2>
          {results.users.length === 0 ? (
            <div className="rounded-md border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink/55">
              찾은 사용자가 없습니다.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {results.users.map((user) => (
                <Link
                  className="rounded-md border border-ink/10 bg-white p-4 shadow-sm transition hover:border-leaf/30"
                  href={`/users/${user.handle}`}
                  key={user.id}
                >
                  <p className="font-black">{user.displayName}</p>
                  <p className="text-sm text-ink/55">@{user.handle}</p>
                  {user.bio ? <p className="mt-2 line-clamp-2 text-sm text-ink/65">{user.bio}</p> : null}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-black text-ink/70">게시글</h2>
          <div className="space-y-3">
            {results.posts.length === 0 ? (
              <div className="rounded-md border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink/55">
                찾은 게시글이 없습니다.
              </div>
            ) : (
              results.posts.map((post) => (
                <PostCard
                  author={{
                    bio: post.author.bio,
                    displayName: post.author.displayName,
                    handle: post.author.handle
                  }}
                  content={post.content}
                  createdAt={post.createdAt}
                  id={post.id}
                  key={post.id}
                  stats={{
                    likes: post.likeCount,
                    replies: post.replyCount,
                    reposts: post.repostCount
                  }}
                  viewer={{
                    liked: post.likes.length > 0,
                    reposted: post.reposts.length > 0
                  }}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
