export default function StockSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <table className="w-full min-w-[1050px] text-left text-sm">
        <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Created By</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 8 }).map((_, index) => (
            <tr key={index} className="border-t border-[#E2E8F0]">
              {Array.from({ length: 8 }).map((__, cellIndex) => (
                <td key={cellIndex} className="px-4 py-4">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
