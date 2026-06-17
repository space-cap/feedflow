import { NextResponse } from "next/server";
import { getDemoUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getDemoUser();
  const following = await prisma.follow.findMany({
    where: {
      followerId: viewer.id,
      status: "accepted"
    },
    select: {
      followingId: true
    }
  });
  const authorIds = [viewer.id, ...following.map((follow) => follow.followingId)];

  const posts = await prisma.post.findMany({
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
          bio: true,
          avatarUrl: true
        }
      },
      likes: {
        where: {
          userId: viewer.id
        },
        select: {
          id: true
        }
      },
      reposts: {
        where: {
          userId: viewer.id
        },
        select: {
          id: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 20
  });

  return NextResponse.json({
    data: posts.map((post) => ({
      id: post.id,
      content: post.content,
      author: post.author,
      counts: {
        likes: post.likeCount,
        replies: post.replyCount,
        reposts: post.repostCount
      },
      viewerState: {
        liked: post.likes.length > 0,
        reposted: post.reposts.length > 0
      },
      createdAt: post.createdAt.toISOString()
    })),
    page: {
      nextCursor: null,
      hasNext: false
    }
  });
}
