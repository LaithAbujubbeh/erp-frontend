import { X } from "lucide-react";

import type { StockMovement } from "../../api/stock";

type StockDetailsModalProps = {
  isOpen: boolean;
  movement: StockMovement | null;
  onClose: () => void;
};

function formatDate(date?: string | null) {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StockDetailsModal({
  isOpen,
  movement,
  onClose,
}: StockDetailsModalProps) {
  if (!isOpen || !movement) return null;

  const isIn = movement.type === "IN";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Stock Movement #{movement.id.slice(0, 8)}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Detailed stock movement information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold uppercase text-[#64748B]">
                Type
              </p>
              <p
                className={`mt-2 font-bold ${
                  isIn ? "text-green-700" : "text-red-600"
                }`}
              >
                {movement.type}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold uppercase text-[#64748B]">
                Quantity
              </p>
              <p className="mt-2 font-bold text-[#0F172A]">
                {isIn ? "+" : "-"}
                {movement.quantity}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold uppercase text-[#64748B]">
                Date
              </p>
              <p className="mt-2 font-semibold text-[#0F172A]">
                {formatDate(movement.createdAt)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] p-4">
            <p className="text-xs font-semibold uppercase text-[#64748B]">
              Product
            </p>
            <p className="mt-2 font-semibold text-[#0F172A]">
              {movement.product?.name || "Unknown product"}
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              SKU: {movement.product?.sku || "N/A"} · Current Stock:{" "}
              {movement.product?.quantity ?? "N/A"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold uppercase text-[#64748B]">
                Reference
              </p>
              <p className="mt-2 font-semibold text-[#0F172A]">
                {movement.referenceType}
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                #{movement.referenceId?.slice(0, 8)}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold uppercase text-[#64748B]">
                Created By
              </p>
              <p className="mt-2 font-semibold text-[#0F172A]">
                {movement.createdBy?.name || "Unknown user"}
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                {movement.createdBy?.role || "N/A"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] p-4">
            <p className="text-xs font-semibold uppercase text-[#64748B]">
              Reason
            </p>
            <p className="mt-2 text-sm text-[#0F172A]">{movement.reason}</p>
          </div>

          <div className="flex justify-end border-t border-[#E2E8F0] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
