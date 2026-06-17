import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { AdminReportActions } from "@/components/admin-report-actions";
import { getSessionUser } from "@/lib/demo-session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const formatter = new Intl.DateTimeFormat("ko-KR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

type AdminReportsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const statusFilters = [
  { label: "전체", value: "" },
  { label: "열림", value: "open" },
  { label: "검토", value: "reviewing" },
  { label: "해결", value: "resolved" },
  { label: "기각", value: "rejected" }
];

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const { status } = await searchParams;
  const user = await getSessionUser();

  if (!user || user.role !== "admin") {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4">
        <section className="rounded-md border border-ink/10 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-black">권한이 필요합니다</h1>
          <p className="mt-2 text-sm text-ink/60">신고 관리는 관리자 계정으로 로그인해야 합니다.</p>
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

  const reports = await prisma.report.findMany({
    where: {
      ...(status ? { status } : {})
    },
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

  const openCount = await prisma.report.count({ where: { status: "open" } });

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
        <nav className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Link
              className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
                (status ?? "") === filter.value
                  ? "border-ink bg-ink text-white"
                  : "border-ink/10 bg-white text-ink hover:bg-mist"
              }`}
              href={filter.value ? `/admin/reports?status=${filter.value}` : "/admin/reports"}
              key={filter.value || "all"}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
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
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    <Link
                      className="font-bold text-leaf hover:text-ink"
                      href={`/admin/reports/${report.id}`}
                    >
                      상세 보기
                    </Link>
                    {report.targetType === "post" ? (
                      <Link className="font-bold text-leaf hover:text-ink" href={`/posts/${report.targetId}`}>
                        대상 게시글
                      </Link>
                    ) : null}
                  </div>
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
