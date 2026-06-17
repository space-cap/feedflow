export default function Loading() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-3xl place-items-center px-4">
      <section className="w-full rounded-md border border-ink/10 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-md bg-mist" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-md bg-mist" />
            <div className="h-3 w-64 max-w-full animate-pulse rounded-md bg-mist" />
          </div>
        </div>
      </section>
    </main>
  );
}
