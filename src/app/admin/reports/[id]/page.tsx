import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminReportActions } from "@/components/admin-report-actions";
import { getSessionUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminReportDetailPageProps = {
  params: Promise<{ id: string }>;
};

const formatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export default async function AdminReportDetailPage({ params }: AdminReportDetailPageProps) {
  const user = await getSessionUser();

  if (!user || user.role !== "admin") {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4">
        <section className="rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-black">권한이 필요합니다</h1>
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

  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: {
        select: {
          handle: true,
          displayName: true
        }
      },
      reviewer: {
        select: {
          handle: true,
          displayName: true
        }
      }
    }
  });

  if (!report) {
    notFound();
  }

  const actions = await prisma.moderationAction.findMany({
    where: {
      OR: [
        { targetType: "report", targetId: report.id },
        { targetType: report.targetType, targetId: report.targetId }
      ]
    },
    include: {
      admin: {
        select: {
          handle: true,
          displayName: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-4 sm:px-6">
      <header className="sticky top-0 z-10 -mx-4 border-b border-ink/10 bg-[#f7faf7]/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            className="grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink shadow-sm transition hover:bg-mist"
            href="/admin/reports"
            title="신고 목록으로"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-normal">신고 상세</h1>
            <p className="text-sm text-ink/60">{report.status}</p>
          </div>
        </div>
      </header>

      <div className="space-y-4 py-4">
        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert aria-hidden="true" className="h-5 w-5 text-coral" />
            <h2 className="font-black">{report.targetType} 신고</h2>
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="font-bold text-ink/60">신고자</dt>
              <dd>
                {report.reporter.displayName} @{report.reporter.handle}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-ink/60">대상</dt>
              <dd className="break-all font-mono">{report.targetId}</dd>
            </div>
            <div>
              <dt className="font-bold text-ink/60">사유</dt>
              <dd>{report.reason}</dd>
            </div>
            <div>
              <dt className="font-bold text-ink/60">접수</dt>
              <dd>{formatter.format(report.createdAt)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            {report.targetType === "post" ? (
              <Link className="font-bold text-leaf hover:text-ink" href={`/posts/${report.targetId}`}>
                대상 게시글 열기
              </Link>
            ) : null}
            <AdminReportActions reportId={report.id} targetId={report.targetId} targetType={report.targetType} />
          </div>
        </section>

        <section className="rounded-md border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="font-black">처리 이력</h2>
          {actions.length === 0 ? (
            <p className="mt-3 text-sm text-ink/55">아직 처리 이력이 없습니다.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {actions.map((action) => (
                <article className="rounded-md border border-ink/10 p-3 text-sm" key={action.id}>
                  <p className="font-bold">{action.action}</p>
                  <p className="text-ink/60">
                    {action.admin.displayName} @{action.admin.handle} · {formatter.format(action.createdAt)}
                  </p>
                  {action.note ? <p className="mt-1">{action.note}</p> : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
