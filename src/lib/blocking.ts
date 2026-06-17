import { prisma } from "@/lib/prisma";

export async function getBlockedUserIds(viewerId: string) {
  const blocks = await prisma.block.findMany({
    where: {
      OR: [{ blockerId: viewerId }, { blockedId: viewerId }]
    },
    select: {
      blockerId: true,
      blockedId: true
    }
  });

  return Array.from(
    new Set(
      blocks.map((block) => (block.blockerId === viewerId ? block.blockedId : block.blockerId))
    )
  );
}

export async function isBlockedBetween(viewerId: string, targetUserId: string) {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: viewerId, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: viewerId }
      ]
    },
    select: { id: true }
  });

  return block !== null;
}
