import { prisma } from "@/lib/prisma";

const loginWindowMs = 15 * 60 * 1000;
const maxFailedAttempts = 5;

export async function isLoginLocked(email: string, ipAddress: string) {
  const since = new Date(Date.now() - loginWindowMs);
  const normalizedEmail = email || "unknown";
  const [emailFailures, ipFailures] = await Promise.all([
    prisma.loginAttempt.count({
      where: {
        email: normalizedEmail,
        success: false,
        createdAt: {
          gte: since
        }
      }
    }),
    prisma.loginAttempt.count({
      where: {
        ipAddress,
        success: false,
        createdAt: {
          gte: since
        }
      }
    })
  ]);

  return emailFailures >= maxFailedAttempts || ipFailures >= maxFailedAttempts;
}

export async function recordLoginAttempt(input: {
  email: string;
  ipAddress: string;
  success: boolean;
  userId?: string | null;
  reason?: string;
}) {
  await prisma.loginAttempt.create({
    data: {
      email: input.email || "unknown",
      ipAddress: input.ipAddress,
      success: input.success,
      userId: input.userId ?? null,
      reason: input.reason ?? null
    }
  });
}
