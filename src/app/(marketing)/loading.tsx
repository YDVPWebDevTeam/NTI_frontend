/**
 * Skeleton shown while async marketing/CMS routes stream in. Mirrors the rough
 * shape of a hero + content section so the layout doesn't jump on load.
 */
export default function MarketingLoading() {
  return (
    <main className="min-h-screen flex-1 pt-32 pb-20" aria-hidden>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="bg-surface-container-high mx-auto h-6 w-32 animate-pulse rounded-full" />
          <div className="bg-surface-container-high mx-auto mt-6 h-12 w-3/4 animate-pulse rounded-2xl" />
          <div className="bg-surface-container-high mx-auto mt-4 h-12 w-2/3 animate-pulse rounded-2xl" />
          <div className="bg-surface-container-high mx-auto mt-6 h-5 w-full animate-pulse rounded-full" />
          <div className="bg-surface-container-high mx-auto mt-3 h-5 w-5/6 animate-pulse rounded-full" />
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="bg-surface-container-high h-48 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
