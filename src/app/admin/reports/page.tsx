import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { AdminReportActions } from "@/components/admin-report-actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      reporter: {
        select: {
          handle: true,
          displayName: true
        }
      }
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 50
  });

  const openCount = reports.filter((report) => report.status === "open").length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-4 sm:px-6">
      <header className="sticky top-0 z-10 -mx-4 border-b border-ink/10 bg-[#f7faf7]/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            className="grid h-10 w-10 place-items-center rounded-md border border-ink/10 bg-white text-ink shadow-sm transition hover:bg-mist"
            href="/"
            title="홈으로"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-normal">신고 관리</h1>
            <p className="text-sm text-ink/60">열린 신고 {openCount}개</p>
          </div>
        </div>
      </header>

      <div className="space-y-3 py-4">
        {reports.length === 0 ? (
          <div className="rounded-md border border-dashed border-ink/15 bg-white p-8 text-center text-sm text-ink/55">
            접수된 신고가 없습니다.
          </div>
        ) : (
          reports.map((report) => (
            <article className="rounded-md border border-ink/10 bg-white p-4 shadow-sm" key={report.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ShieldAlert aria-hidden="true" className="h-5 w-5 text-coral" />
                    <h2 className="font-black">{report.targetType} 신고</h2>
                    <span className="rounded-md bg-mist px-2 py-1 text-xs font-bold text-ink/65">
                      {report.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ink/60">
                    신고자 @{report.reporter.handle} · {formatter.format(report.createdAt)}
                  </p>
                  <p className="mt-3 break-all text-sm">
                    대상: <span className="font-mono">{report.targetId}</span>
                  </p>
                  <p className="mt-1 text-sm">사유: {report.reason}</p>
                </div>
                <AdminReportActions
                  reportId={report.id}
                  targetId={report.targetId}
                  targetType={report.targetType}
                />
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
