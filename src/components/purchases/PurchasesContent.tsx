import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { useState } from "react";

import {
  cancelPurchase,
  getPurchases,
  updatePurchaseStatus,
  type Purchase,
} from "../../api/purchases";
import { getSuppliers } from "../../api/suppliers";
import { useAuth } from "../../hooks/useAuth";
import DeleteConfirmModal from "../DeleteConfirmModal";
import StatusBadge from "../StatusBadge";
import PurchaseDetailsModal from "./PurchaseDetailsModal";
import PurchaseFormModal from "./PurchaseFormModal";
import PurchasesSkeleton from "./PurchasesSkeleton";

type PurchasesContentProps = {
  page: number;
  status: string;
  supplierId: string;
  onStatusChange: (value: string) => void;
  onSupplierChange: (value: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
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

export default function PurchasesContent({
  page,
  status,
  supplierId,
  onStatusChange,
  onSupplierChange,
  onClearFilters,
  onPageChange,
}: PurchasesContentProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [purchaseToReceive, setPurchaseToReceive] = useState<Purchase | null>(
    null,
  );
  const [purchaseToCancel, setPurchaseToCancel] = useState<Purchase | null>(
    null,
  );

  const purchasesQuery = useQuery({
    queryKey: ["purchases", { page, status, supplierId }],
    queryFn: () =>
      getPurchases({
        page,
        limit: 10,
        status,
        supplierId,
      }),
  });

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", "purchase-filter"],
    queryFn: () =>
      getSuppliers({
        page: 1,
        limit: 50,
        status: "ACTIVE",
      }),
  });

  const receivePurchaseMutation = useMutation({
    mutationFn: (id: string) => updatePurchaseStatus(id, "RECEIVED"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setPurchaseToReceive(null);
    },
  });

  const cancelPurchaseMutation = useMutation({
    mutationFn: cancelPurchase,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setPurchaseToCancel(null);
    },
  });

  const purchases = purchasesQuery.data?.purchases ?? [];
  const pagination = purchasesQuery.data?.pagination;
  const suppliers = suppliersQuery.data?.suppliers ?? [];

  const hasFilters = Boolean(status || supplierId);

  const canCreatePurchase =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "INVENTORY_STAFF";

  const canManagePurchase = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Purchases</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage supplier purchases and inventory restocking records.
          </p>
        </div>

        {canCreatePurchase && (
          <button
            type="button"
            onClick={() => setIsPurchaseModalOpen(true)}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Purchase
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={supplierId}
              onChange={(e) => onSupplierChange(e.target.value)}
              disabled={suppliersQuery.isPending}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {suppliersQuery.isPending
                  ? "Loading suppliers..."
                  : "All Suppliers"}
              </option>

              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Pending</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
              >
                All Purchases
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {supplierId && (
              <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700">
                Supplier:{" "}
                {suppliers.find((supplier) => supplier.id === supplierId)
                  ?.name || "Selected supplier"}
              </span>
            )}

            {status && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                Status: {status}
              </span>
            )}
          </div>
        )}
      </div>

      {purchasesQuery.isPending ? (
        <PurchasesSkeleton />
      ) : purchasesQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {purchasesQuery.error.message}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">Purchase</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Subtotal</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#64748B]">
                        <ClipboardList size={32} />
                        <p>No purchases found.</p>

                        {hasFilters && (
                          <button
                            type="button"
                            onClick={onClearFilters}
                            className="mt-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
                          >
                            Back to all purchases
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => {
                    const canReceive =
                      canManagePurchase &&
                      purchase.status !== "RECEIVED" &&
                      purchase.status !== "CANCELLED";

                    const canCancel =
                      canManagePurchase &&
                      purchase.status !== "RECEIVED" &&
                      purchase.status !== "CANCELLED";

                    return (
                      <tr
                        key={purchase.id}
                        className="border-t border-[#E2E8F0]"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0F172A]">
                            #{purchase.id.slice(0, 8)}
                          </p>

                          {purchase.receivedAt && (
                            <p className="mt-1 text-xs text-[#64748B]">
                              Received: {formatDate(purchase.receivedAt)}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {purchase.supplier?.name || "No supplier"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#0F172A]">
                            {purchase.user?.name || "Unknown user"}
                          </p>

                          {purchase.user?.role && (
                            <p className="mt-1 text-xs text-[#64748B]">
                              {purchase.user.role}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {purchase.items?.length ?? 0}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#0F172A]">
                          {formatCurrency(purchase.subtotal)}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#0F172A]">
                          {formatCurrency(purchase.total)}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={purchase.status} />
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {formatDate(purchase.createdAt)}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPurchase(purchase)}
                              className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                            >
                              View
                            </button>

                            {canReceive && (
                              <button
                                type="button"
                                onClick={() => setPurchaseToReceive(purchase)}
                                className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
                              >
                                Receive
                              </button>
                            )}

                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => setPurchaseToCancel(purchase)}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
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
              {pagination?.total ?? 0} purchases
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

      <PurchaseFormModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />

      <PurchaseDetailsModal
        isOpen={!!selectedPurchase}
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />
      <DeleteConfirmModal
        isOpen={!!purchaseToReceive}
        title="Receive Purchase"
        description={`Mark purchase #${
          purchaseToReceive?.id.slice(0, 8) ?? ""
        } as received? This will increase product stock and create stock movement records.`}
        isDeleting={receivePurchaseMutation.isPending}
        error={
          receivePurchaseMutation.isError
            ? receivePurchaseMutation.error.message
            : undefined
        }
        confirmText="Receive Purchase"
        loadingText="Receiving..."
        variant="success"
        onClose={() => {
          setPurchaseToReceive(null);
          receivePurchaseMutation.reset();
        }}
        onConfirm={() => {
          if (!purchaseToReceive) return;
          receivePurchaseMutation.mutate(purchaseToReceive.id);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!purchaseToCancel}
        title="Cancel Purchase"
        description={`Cancel purchase #${
          purchaseToCancel?.id.slice(0, 8) ?? ""
        }? This purchase cannot be received after cancellation.`}
        isDeleting={cancelPurchaseMutation.isPending}
        error={
          cancelPurchaseMutation.isError
            ? cancelPurchaseMutation.error.message
            : undefined
        }
        confirmText="Cancel Purchase"
        loadingText="Cancelling..."
        variant="danger"
        onClose={() => {
          setPurchaseToCancel(null);
          cancelPurchaseMutation.reset();
        }}
        onConfirm={() => {
          if (!purchaseToCancel) return;
          cancelPurchaseMutation.mutate(purchaseToCancel.id);
        }}
      />
    </div>
  );
}
