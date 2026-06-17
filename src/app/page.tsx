import { Bell, Compass, Home, LogIn, Search, Settings, SquarePen, UserRound, UserPlus } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { PostCard } from "@/components/post-card";
import { PostComposer } from "@/components/post-composer";
import { getDemoUser, getSessionUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getHomePosts(viewerId: string) {
  const following = await prisma.follow.findMany({
    where: {
      followerId: viewerId,
      status: "accepted"
    },
    select: {
      followingId: true
    }
  });
  const authorIds = [viewerId, ...following.map((follow) => follow.followingId)];

  return prisma.post.findMany({
    where: {
      authorId: {
        in: authorIds
      },
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
      },
      likes: {
        where: {
          userId: viewerId
        },
        select: {
          id: true
        }
      },
      reposts: {
        where: {
          userId: viewerId
        },
        select: {
          id: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 20
  });
}

export default async function HomePage() {
  const sessionUser = await getSessionUser();
  const viewer = await getDemoUser();
  const posts = await getHomePosts(viewer.id);

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
              <p className="text-sm text-ink/60">@{viewer.handle}</p>
            </div>
          </div>

          <div className="mb-5 rounded-md border border-ink/10 bg-white p-3 shadow-sm">
            {sessionUser ? (
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs font-bold text-leaf">로그인됨</p>
                  <p className="text-sm font-black">{sessionUser.displayName}</p>
                  <p className="text-xs text-ink/55">@{sessionUser.handle}</p>
                </div>
                <LogoutButton variant="compact" />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-bold text-ink/55">계정</p>
                <Link
                  className="flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-bold text-white transition hover:bg-leaf"
                  href="/login"
                >
                  <LogIn aria-hidden="true" className="h-4 w-4" />
                  <span>로그인</span>
                </Link>
                <Link
                  className="flex h-10 items-center justify-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-bold text-ink transition hover:bg-mist"
                  href="/signup"
                >
                  <UserPlus aria-hidden="true" className="h-4 w-4" />
                  <span>회원가입</span>
                </Link>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {[
              { icon: Home, label: "홈", href: "/" },
              { icon: Compass, label: "탐색", href: "/explore" },
              { icon: Bell, label: "알림", href: "/notifications" },
              { icon: UserRound, label: "프로필", href: `/users/${viewer.handle}` },
              { icon: Settings, label: "설정", href: "/settings" }
            ].map((item) => (
              <Link
                className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-left font-semibold text-ink transition hover:bg-white"
                href={item.href}
                key={item.label}
                title={item.label}
              >
                <item.icon aria-hidden="true" className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
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
              <p className="text-sm text-ink/60">팔로우 피드</p>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              {sessionUser ? (
                <LogoutButton iconOnly />
              ) : (
                <Link
                  className="grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink shadow-sm"
                  href="/login"
                  title="로그인"
                >
                  <LogIn aria-hidden="true" className="h-5 w-5" />
                </Link>
              )}
              <Link
                className="grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink shadow-sm"
                href="/explore"
                title="검색"
              >
                <Search aria-hidden="true" className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>

        <div className="py-4">
          <PostComposer />
        </div>

        <div className="space-y-3 pb-10">
          {posts.length === 0 ? (
            <div className="rounded-md border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/55">
              팔로우한 계정의 게시글이 아직 없습니다.
            </div>
          ) : (
            posts.map((post) => (
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
                <Link className="font-bold transition hover:text-leaf" href="/users/product">
                  @product
                </Link>
                <p className="text-ink/60">제품 기록</p>
              </div>
              <div>
                <Link className="font-bold transition hover:text-leaf" href="/users/design">
                  @design
                </Link>
                <p className="text-ink/60">화면 설계</p>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </main>
  );
}
