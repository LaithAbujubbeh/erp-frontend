export default function PurchasesSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
          <tr>
            <th className="px-4 py-3">Purchase</th>
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created At</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 8 }).map((_, index) => (
            <tr key={index} className="border-t border-[#E2E8F0]">
              <td className="px-4 py-4">
                <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
              </td>

              <td className="px-4 py-4">
                <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
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
