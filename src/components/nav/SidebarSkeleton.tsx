export default function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col bg-[#2E3039] p-3 text-[#C3C6D7] md:flex">
      <div className="mb-8 flex items-center gap-3">
        <div className="size-10 animate-pulse rounded bg-white/10" />

        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        </div>
      </div>

      <div className="mb-6 rounded bg-[#252730] p-3">
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-white/10" />
      </div>

      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-11 animate-pulse rounded bg-white/10" />
        ))}
      </div>

      <div className="mt-auto h-11 animate-pulse rounded bg-white/10" />
    </aside>
  );
}
