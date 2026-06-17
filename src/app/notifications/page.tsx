import { ArrowLeft, Heart, MessageCircle, Repeat2, UserPlus } from "lucide-react";
import Link from "next/link";
import { ReadAllNotificationsButton } from "@/components/read-all-notifications-button";
import { getSessionUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

function getNotificationText(type: string, actorName: string) {
  if (type === "like") {
    return `${actorName}님이 게시글을 좋아합니다.`;
  }
  if (type === "reply") {
    return `${actorName}님이 댓글을 남겼습니다.`;
  }
  if (type === "follow") {
    return `${actorName}님이 나를 팔로우했습니다.`;
  }
  if (type === "repost") {
    return `${actorName}님이 게시글을 재게시했습니다.`;
  }
  return "새 알림이 있습니다.";
}

function NotificationIcon({ type }: { type: string }) {
  if (type === "like") {
    return <Heart aria-hidden="true" className="h-5 w-5" />;
  }
  if (type === "reply") {
    return <MessageCircle aria-hidden="true" className="h-5 w-5" />;
  }
  if (type === "follow") {
    return <UserPlus aria-hidden="true" className="h-5 w-5" />;
  }
  return <Repeat2 aria-hidden="true" className="h-5 w-5" />;
}

export default async function NotificationsPage() {
  const viewer = await getSessionUser();

  if (!viewer) {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4">
        <section className="rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-black">로그인이 필요합니다</h1>
          <p className="mt-2 text-sm text-ink/60">알림은 로그인 후 확인할 수 있습니다.</p>
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
  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: viewer.id
    },
    include: {
      actor: {
        select: {
          id: true,
          handle: true,
          displayName: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 50
  });

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-4 sm:px-6">
      <header className="sticky top-0 z-10 -mx-4 border-b border-ink/10 bg-[#f7faf7]/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              className="grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink shadow-sm transition hover:bg-mist"
              href="/"
              title="홈으로"
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black tracking-normal">알림</h1>
              <p className="text-sm text-ink/60">읽지 않음 {unreadCount}개</p>
            </div>
          </div>
          <ReadAllNotificationsButton />
        </div>
      </header>

      <div className="space-y-3 py-4">
        {notifications.length === 0 ? (
          <div className="rounded-md border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/55">
            아직 알림이 없습니다.
          </div>
        ) : (
          notifications.map((notification) => {
            const actorName = notification.actor?.displayName ?? "누군가";
            const content = (
              <article className="flex gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm transition hover:border-leaf/30">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-mist text-leaf">
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {!notification.readAt ? (
                      <span className="h-2 w-2 rounded-full bg-coral" aria-label="읽지 않음" />
                    ) : null}
                    <p className="font-bold">{getNotificationText(notification.type, actorName)}</p>
                  </div>
                  <p className="mt-1 text-sm text-ink/55">
                    {notification.actor ? `@${notification.actor.handle}` : "system"} ·{" "}
                    {formatter.format(notification.createdAt)}
                  </p>
                </div>
              </article>
            );

            return notification.postId ? (
              <Link href={`/posts/${notification.postId}`} key={notification.id}>
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })
        )}
      </div>
    </main>
  );
}
