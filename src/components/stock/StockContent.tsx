import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Boxes } from "lucide-react";
import { useState } from "react";

import { getProducts } from "../../api/products";
import { getStockMovements, type StockMovement } from "../../api/stock";
import StockDetailsModal from "./StockDetailsModal";
import StockSkeleton from "./StockSkeleton";

type StockContentProps = {
  page: number;
  type: string;
  productId: string;
  referenceType: string;
  startDate: string;
  endDate: string;
  onTypeChange: (value: string) => void;
  onProductChange: (value: string) => void;
  onReferenceTypeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
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

export default function StockContent({
  page,
  type,
  productId,
  referenceType,
  startDate,
  endDate,
  onTypeChange,
  onProductChange,
  onReferenceTypeChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  onPageChange,
}: StockContentProps) {
  const [selectedMovement, setSelectedMovement] =
    useState<StockMovement | null>(null);

  const stockQuery = useQuery({
    queryKey: [
      "stock-movements",
      { page, type, productId, referenceType, startDate, endDate },
    ],
    queryFn: () =>
      getStockMovements({
        page,
        limit: 10,
        type,
        productId,
        referenceType,
        startDate,
        endDate,
      }),
  });

  const productsQuery = useQuery({
    queryKey: ["products", "stock-filter"],
    queryFn: () =>
      getProducts({
        page: 1,
        limit: 50,
        status: "ACTIVE",
      }),
  });

  const movements = stockQuery.data?.movements ?? [];
  const pagination = stockQuery.data?.pagination;
  const products = productsQuery.data?.products ?? [];

  const hasFilters = Boolean(
    type || productId || referenceType || startDate || endDate,
  );

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Stock Movements</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Track stock coming in from purchases and going out through orders.
        </p>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Product
            </label>

            <select
              value={productId}
              onChange={(e) => onProductChange(e.target.value)}
              disabled={productsQuery.isPending}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {productsQuery.isPending ? "Loading..." : "All Products"}
              </option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {product.sku}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Type
            </label>

            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            >
              <option value="">All Types</option>
              <option value="IN">Stock In</option>
              <option value="OUT">Stock Out</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Reference
            </label>

            <select
              value={referenceType}
              onChange={(e) => onReferenceTypeChange(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            >
              <option value="">All References</option>
              <option value="PURCHASE">Purchase</option>
              <option value="ORDER">Order</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-end">
            {hasFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="w-full rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {productId && (
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                Product:{" "}
                {products.find((product) => product.id === productId)?.name ||
                  "Selected product"}
              </span>
            )}

            {type && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                Type: {type}
              </span>
            )}

            {referenceType && (
              <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700">
                Reference: {referenceType}
              </span>
            )}

            {startDate && (
              <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
                From: {startDate}
              </span>
            )}

            {endDate && (
              <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
                To: {endDate}
              </span>
            )}
          </div>
        )}
      </div>

      {stockQuery.isPending ? (
        <StockSkeleton />
      ) : stockQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {stockQuery.error.message}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
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
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#64748B]">
                        <Boxes size={32} />
                        <p>No stock movements found.</p>

                        {hasFilters && (
                          <button
                            type="button"
                            onClick={onClearFilters}
                            className="mt-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => {
                    const isIn = movement.type === "IN";

                    return (
                      <tr
                        key={movement.id}
                        className="border-t border-[#E2E8F0]"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0F172A]">
                            {movement.product?.name || "Unknown product"}
                          </p>
                          <p className="mt-1 text-xs text-[#64748B]">
                            SKU: {movement.product?.sku || "N/A"}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isIn
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isIn ? (
                              <ArrowDownLeft size={14} />
                            ) : (
                              <ArrowUpRight size={14} />
                            )}
                            {isIn ? "Stock In" : "Stock Out"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`font-bold ${
                              isIn ? "text-green-700" : "text-red-600"
                            }`}
                          >
                            {isIn ? "+" : "-"}
                            {movement.quantity}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {movement.reason}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-[#0F172A]">
                            {movement.referenceType}
                          </p>
                          <p className="mt-1 text-xs text-[#64748B]">
                            #{movement.referenceId?.slice(0, 8)}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-[#0F172A]">
                            {movement.createdBy?.name || "Unknown user"}
                          </p>
                          <p className="mt-1 text-xs text-[#64748B]">
                            {movement.createdBy?.role || "N/A"}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {formatDate(movement.createdAt)}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedMovement(movement)}
                            className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E2E8F0] px-4 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#64748B]">
              Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1} ·{" "}
              {pagination?.total ?? 0} movements
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={!pagination || page >= pagination.totalPages}
                onClick={() => onPageChange(page + 1)}
                className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <StockDetailsModal
        isOpen={!!selectedMovement}
        movement={selectedMovement}
        onClose={() => setSelectedMovement(null)}
      />
    </div>
  );
}
