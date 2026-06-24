export default function CategoriesSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
          <tr>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Created At</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 6 }).map((_, index) => (
            <tr key={index} className="border-t border-[#E2E8F0]">
              <td className="px-4 py-4">
                <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="ml-auto h-8 w-28 animate-pulse rounded bg-slate-200" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
