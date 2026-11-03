import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockButton } from "@/components/block-button";
import { FollowButton } from "@/components/follow-button";
import { PostCard } from "@/components/post-card";
import { getBlockedUserIds, isBlockedBetween } from "@/lib/blocking";
import { getDemoUser, getSessionUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type UserProfilePageProps = {
  params: Promise<{
    handle: string;
  }>;
};

async function getProfile(handle: string, viewerId: string) {
  const blockedUserIds = await getBlockedUserIds(viewerId);
  const user = await prisma.user.findFirst({
    where: {
      handle,
      deletedAt: null,
      status: "active"
    },
    include: {
      followerConnections: {
        where: { status: "accepted" },
        select: { id: true }
      },
      followingConnections: {
        where: { status: "accepted" },
        select: { id: true }
      },
      posts: {
        where: {
          deletedAt: null,
          isHidden: false,
          parentPostId: null,
          authorId: {
            notIn: blockedUserIds
          }
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
        orderBy: [{ createdAt: "desc" }, { id: "desc" }]
      }
    }
  });

  if (!user) {
    return null;
  }

  if (await isBlockedBetween(viewerId, user.id)) {
    return null;
  }

  const relationship = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: viewerId,
        followingId: user.id
      }
    },
    select: { status: true }
  });
  const block = await prisma.block.findUnique({
    where: {
      blockerId_blockedId: {
        blockerId: viewerId,
        blockedId: user.id
      }
    },
    select: { id: true }
  });

  return {
    user,
    relationship: relationship?.status ?? "none",
    blocked: block !== null
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { handle } = await params;
  const sessionUser = await getSessionUser();
  const viewer = await getDemoUser();
  const profile = await getProfile(handle, viewer.id);

  if (!profile) {
    notFound();
  }

  const isSelf = profile.user.id === sessionUser?.id;
  const canSeePosts =
    !profile.user.isPrivate || isSelf || profile.relationship === "accepted";

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-5xl grid-cols-1 gap-0 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8">
      <section className="min-w-0 border-ink/10 py-4 lg:border-r lg:pr-6">
        <header className="sticky top-0 z-10 -mx-4 border-b border-ink/10 bg-[#f7faf7]/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex items-center gap-4">
            <Link
              className="grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink shadow-sm transition hover:bg-mist"
              href="/"
              title="홈으로"
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-normal">{profile.user.displayName}</h1>
              <p className="text-sm text-ink/60">@{profile.user.handle}</p>
            </div>
          </div>
        </header>

        <div className="space-y-4 py-4">
          <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-mist text-2xl font-black text-leaf">
                {profile.user.displayName.slice(0, 1).toUpperCase()}
              </div>
              {sessionUser && !isSelf ? (
                <div className="flex flex-wrap gap-2">
                  <FollowButton
                    initialStatus={profile.relationship as "none" | "pending" | "accepted"}
                    userId={profile.user.id}
                  />
                  <BlockButton initialBlocked={profile.blocked} userId={profile.user.id} />
                </div>
              ) : null}
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-black">{profile.user.displayName}</h2>
              <p className="text-sm text-ink/55">@{profile.user.handle}</p>
              {profile.user.bio ? <p className="mt-3 leading-7">{profile.user.bio}</p> : null}
              <div className="mt-4 flex gap-5 text-sm text-ink/60">
                <span>
                  <strong className="text-ink">{profile.user.posts.length}</strong> 게시글
                </span>
                <span>
                  <strong className="text-ink">{profile.user.followerConnections.length}</strong> 팔로워
                </span>
                <span>
                  <strong className="text-ink">{profile.user.followingConnections.length}</strong> 팔로잉
                </span>
              </div>
            </div>
          </section>

          {!canSeePosts ? (
            <div className="rounded-md border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink/55">
              비공개 계정입니다. 팔로우 승인을 기다려 주세요.
            </div>
          ) : (
            <div className="space-y-3">
              {profile.user.posts.map((post) => (
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
                    liked: sessionUser ? post.likes.length > 0 : false,
                    reposted: sessionUser ? post.reposts.length > 0 : false,
                    canManage: post.author.id === sessionUser?.id
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <aside className="hidden py-6 pl-5 lg:block">
        <div className="sticky top-6 space-y-5">
          <div className="flex h-11 items-center gap-3 rounded-md border border-ink/10 bg-white px-3 shadow-sm">
            <Search aria-hidden="true" className="h-5 w-5 text-ink/50" />
            <span className="text-sm text-ink/50">검색</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
