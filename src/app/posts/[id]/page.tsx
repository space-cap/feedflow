import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { ReplyComposer } from "@/components/reply-composer";
import { getBlockedUserIds, isBlockedBetween } from "@/lib/blocking";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function getPost(id: string, viewerId: string) {
  const blockedUserIds = await getBlockedUserIds(viewerId);
  return prisma.post.findFirst({
    where: {
      id,
      deletedAt: null,
      isHidden: false,
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
      },
      replies: {
        where: {
          deletedAt: null,
          isHidden: false,
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
        orderBy: [{ createdAt: "asc" }, { id: "asc" }]
      }
    }
  });
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const viewer = await getDemoUser();
  const post = await getPost(id, viewer.id);

  if (!post || (await isBlockedBetween(viewer.id, post.author.id))) {
    notFound();
  }

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
              <h1 className="text-2xl font-black tracking-normal">게시글</h1>
              <p className="text-sm text-ink/60">댓글 {post.replyCount}개</p>
            </div>
          </div>
        </header>

        <div className="space-y-4 py-4">
          <PostCard
            author={{
              bio: post.author.bio,
              displayName: post.author.displayName,
              handle: post.author.handle
            }}
            content={post.content}
            createdAt={post.createdAt}
            id={post.id}
            stats={{
              likes: post.likeCount,
              replies: post.replyCount,
              reposts: post.repostCount
            }}
            viewer={{
              liked: post.likes.length > 0,
              reposted: post.reposts.length > 0,
              canManage: post.author.id === viewer.id
            }}
          />

          <ReplyComposer postId={post.id} />

          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-ink/70">댓글</h2>
              <span className="text-sm text-ink/50">{post.replies.length}</span>
            </div>

            {post.replies.length === 0 ? (
              <div className="rounded-md border border-dashed border-ink/15 bg-white p-6 text-center text-sm text-ink/55">
                아직 댓글이 없습니다.
              </div>
            ) : (
              post.replies.map((reply) => (
                <PostCard
                  author={{
                    bio: reply.author.bio,
                    displayName: reply.author.displayName,
                    handle: reply.author.handle
                  }}
                  content={reply.content}
                  createdAt={reply.createdAt}
                  id={reply.id}
                  key={reply.id}
                  stats={{
                    likes: reply.likeCount,
                    replies: reply.replyCount,
                    reposts: reply.repostCount
                  }}
                  viewer={{
                    liked: reply.likes.length > 0,
                    reposted: reply.reposts.length > 0,
                    canManage: reply.author.id === viewer.id
                  }}
                />
              ))
            )}
          </section>
        </div>
      </section>

      <aside className="hidden py-6 pl-5 lg:block">
        <div className="sticky top-6 space-y-5">
          <div className="flex h-11 items-center gap-3 rounded-md border border-ink/10 bg-white px-3 shadow-sm">
            <Search aria-hidden="true" className="h-5 w-5 text-ink/50" />
            <span className="text-sm text-ink/50">검색</span>
          </div>

          <section className="rounded-md border border-ink/10 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-black text-ink/70">다음 구현 후보</h2>
            <div className="space-y-2 text-sm text-ink/65">
              <p>좋아요 토글</p>
              <p>프로필 화면</p>
              <p>팔로우 API</p>
            </div>
          </section>
        </div>
      </aside>
    </main>
  );
}
