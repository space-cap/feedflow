import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [demo, product, design, admin] = await Promise.all([
    prisma.user.upsert({
      where: { handle: "demo" },
      update: {},
      create: {
        email: "demo@feedflow.local",
        passwordHash: "dev-only-password-hash",
        handle: "demo",
        displayName: "Demo User",
        bio: "FeedFlow 첫 개발 계정입니다."
      }
    }),
    prisma.user.upsert({
      where: { handle: "product" },
      update: {},
      create: {
        email: "product@feedflow.local",
        passwordHash: "dev-only-password-hash",
        handle: "product",
        displayName: "Product Notes",
        bio: "짧은 글 소셜 서비스의 제품 감각을 기록합니다."
      }
    }),
    prisma.user.upsert({
      where: { handle: "design" },
      update: {},
      create: {
        email: "design@feedflow.local",
        passwordHash: "dev-only-password-hash",
        handle: "design",
        displayName: "Design Desk",
        bio: "피드, 프로필, 작성 경험을 다듬는 중입니다."
      }
    }),
    prisma.user.upsert({
      where: { handle: "admin" },
      update: {
        role: "admin"
      },
      create: {
        email: "admin@feedflow.local",
        passwordHash: "dev-only-password-hash",
        handle: "admin",
        displayName: "FeedFlow Admin",
        bio: "신고와 운영 관리를 확인하는 관리자 계정입니다.",
        role: "admin"
      }
    })
  ]);

  void admin;

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: demo.id,
        followingId: product.id
      }
    },
    update: {},
    create: {
      followerId: demo.id,
      followingId: product.id,
      status: "accepted"
    }
  });

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: demo.id,
        followingId: design.id
      }
    },
    update: {},
    create: {
      followerId: demo.id,
      followingId: design.id,
      status: "accepted"
    }
  });

  const existingCount = await prisma.post.count();

  if (existingCount === 0) {
    const firstPost = await prisma.post.create({
      data: {
        authorId: product.id,
        content:
          "FeedFlow MVP는 가입, 게시, 팔로우, 홈 피드의 네 흐름을 먼저 단단하게 연결합니다.",
        likeCount: 4,
        replyCount: 1,
        repostCount: 2
      }
    });

    await prisma.post.createMany({
      data: [
        {
          authorId: design.id,
          content:
            "첫 화면은 설명보다 피드가 먼저 보여야 합니다. 사용자는 서비스 소개가 아니라 글을 읽으러 들어옵니다.",
          likeCount: 7,
          replyCount: 2,
          repostCount: 1
        },
        {
          authorId: demo.id,
          content:
            "SQLite 개발 DB 연결 완료. 이제 작은 기능을 끝까지 붙여 보면서 리듬을 잡으면 됩니다.",
          likeCount: 3,
          replyCount: 0,
          repostCount: 0
        },
        {
          authorId: design.id,
          parentPostId: firstPost.id,
          content: "좋아요. 피드와 작성 경험만 빨리 검증해도 방향이 꽤 선명해질 것 같아요.",
          likeCount: 1,
          replyCount: 0,
          repostCount: 0
        }
      ]
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
