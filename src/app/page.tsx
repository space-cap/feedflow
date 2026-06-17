import { Bell, Compass, Home, Search, Settings, SquarePen, UserRound } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getExplorePosts() {
  return prisma.post.findMany({
    where: {
      deletedAt: null,
      isHidden: false,
      parentPostId: null
    },
    include: {
      author: {
        select: {
          id: true,
          handle: true,
          displayName: true,
          bio: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 20
  });
}

export default async function HomePage() {
  const posts = await getExplorePosts();

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-0 px-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_280px] lg:px-8">
      <aside className="hidden border-r border-ink/10 py-6 pr-5 lg:block">
        <div className="sticky top-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-leaf text-lg font-black text-white">
              F
            </div>
            <div>
              <p className="text-lg font-black leading-tight">FeedFlow</p>
              <p className="text-sm text-ink/60">@demo</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { icon: Home, label: "홈" },
              { icon: Compass, label: "탐색" },
              { icon: Bell, label: "알림" },
              { icon: UserRound, label: "프로필" },
              { icon: Settings, label: "설정" }
            ].map((item) => (
              <button
                className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-left font-semibold text-ink transition hover:bg-white"
                key={item.label}
                type="button"
                title={item.label}
              >
                <item.icon aria-hidden="true" className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <button
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 font-bold text-white transition hover:bg-leaf"
            type="button"
          >
            <SquarePen aria-hidden="true" className="h-5 w-5" />
            <span>작성</span>
          </button>
        </div>
      </aside>

      <section className="min-w-0 border-ink/10 py-4 lg:border-r lg:px-6">
        <header className="sticky top-0 z-10 -mx-4 border-b border-ink/10 bg-[#f7faf7]/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-normal">홈</h1>
              <p className="text-sm text-ink/60">공개 피드</p>
            </div>
            <button
              className="grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink shadow-sm lg:hidden"
              type="button"
              title="검색"
            >
              <Search aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="py-4">
          <PostComposer />
        </div>

        <div className="space-y-3 pb-10">
          {posts.map((post) => (
            <PostCard
              author={{
                bio: post.author.bio,
                displayName: post.author.displayName,
                handle: post.author.handle
              }}
              content={post.content}
              createdAt={post.createdAt}
              key={post.id}
              stats={{
                likes: post.likeCount,
                replies: post.replyCount,
                reposts: post.repostCount
              }}
            />
          ))}
        </div>
      </section>

      <aside className="hidden py-6 pl-5 lg:block">
        <div className="sticky top-6 space-y-5">
          <div className="flex h-11 items-center gap-3 rounded-md border border-ink/10 bg-white px-3 shadow-sm">
            <Search aria-hidden="true" className="h-5 w-5 text-ink/50" />
            <span className="text-sm text-ink/50">검색</span>
          </div>

          <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-black text-ink/70">지금 보기 좋은 계정</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-bold">@product</p>
                <p className="text-ink/60">제품 기록</p>
              </div>
              <div>
                <p className="font-bold">@design</p>
                <p className="text-ink/60">화면 설계</p>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </main>
  );
}
