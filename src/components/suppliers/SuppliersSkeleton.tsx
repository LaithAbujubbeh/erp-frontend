export default function SuppliersSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
          <tr>
            <th className="px-4 py-3">Supplier</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Address</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created At</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 7 }).map((_, index) => (
            <tr key={index} className="border-t border-[#E2E8F0]">
              {Array.from({ length: 7 }).map((__, cellIndex) => (
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
