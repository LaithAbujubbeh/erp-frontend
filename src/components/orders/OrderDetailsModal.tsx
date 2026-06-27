import { X } from "lucide-react";

import type { Order } from "../../api/orders";
import StatusBadge from "../StatusBadge";

type OrderDetailsModalProps = {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
};

function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date?: string | null) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OrderDetailsModal({
  isOpen,
  order,
  onClose,
}: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              Order #{order.id.slice(0, 8)}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Order details and item breakdown.
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

        <div className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold uppercase text-[#64748B]">
                Customer
              </p>
              <p className="mt-2 font-semibold text-[#0F172A]">
                {order.customer?.name || "No customer"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold uppercase text-[#64748B]">
                Created By
              </p>
              <p className="mt-2 font-semibold text-[#0F172A]">
                {order.user?.name || "Unknown user"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold uppercase text-[#64748B]">
                Status
              </p>
              <div className="mt-2">
                <StatusBadge status={order.status} />
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold uppercase text-[#64748B]">
                Created At
              </p>
              <p className="mt-2 font-semibold text-[#0F172A]">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {order.paidAt && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              This order was paid on {formatDate(order.paidAt)}.
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
              <h3 className="font-semibold text-[#0F172A]">Items</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-white text-xs uppercase text-[#64748B]">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3 text-right">Total Price</th>
                  </tr>
                </thead>

                <tbody>
                  {order.items?.length ? (
                    order.items.map((item) => (
                      <tr key={item.id} className="border-t border-[#E2E8F0]">
                        <td className="px-4 py-3 font-semibold text-[#0F172A]">
                          {item.product?.name || "Unknown product"}
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {item.product?.sku || "N/A"}
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {item.quantity}
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {formatCurrency(item.unitPrice)}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-[#64748B]"
                      >
                        No items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2 rounded-xl border border-[#E2E8F0] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Subtotal</span>
                <span className="font-semibold text-[#0F172A]">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between border-t border-[#E2E8F0] pt-2 text-lg">
                <span className="font-bold text-[#0F172A]">Total</span>
                <span className="font-bold text-[#0F172A]">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
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
