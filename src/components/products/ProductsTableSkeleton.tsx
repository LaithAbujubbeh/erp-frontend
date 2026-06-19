export default function ProductsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Selling Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 8 }).map((_, index) => (
              <tr key={index} className="border-t border-[#E2E8F0]">
                <td className="px-4 py-4">
                  <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-52 animate-pulse rounded bg-slate-100" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-6 w-12 animate-pulse rounded-full bg-slate-200" />
                </td>

                <td className="px-4 py-4">
                  <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                </td>

                <td className="px-4 py-4">
                  <div className="ml-auto h-8 w-24 animate-pulse rounded bg-slate-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between border-t border-[#E2E8F0] px-4 py-4">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-40 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
