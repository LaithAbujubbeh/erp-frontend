import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Truck } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  deleteSupplier,
  getSuppliers,
  type Supplier,
} from "../../api/suppliers";
import { useAuth } from "../../hooks/useAuth";
import StatusBadge from "../StatusBadge";
import DeleteConfirmModal from "../DeleteConfirmModal";
import SuppliersSkeleton from "./SuppliersSkeleton";
import SupplierFormModal from "./SupplierFormModal";

type SuppliersContentProps = {
  page: number;
  search: string;
  status: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (e: FormEvent<HTMLFormElement>) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SuppliersContent({
  page,
  search,
  status,
  searchInput,
  onSearchInputChange,
  onSearch,
  onStatusChange,
  onClearFilters,
  onPageChange,
}: SuppliersContentProps) {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null,
  );

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", { page, search, status }],
    queryFn: () =>
      getSuppliers({
        page,
        limit: 10,
        search,
        status,
      }),
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setSupplierToDelete(null);
    },
  });

  const suppliers = suppliersQuery.data?.suppliers ?? [];
  const pagination = suppliersQuery.data?.pagination;

  const hasFilters = Boolean(search || status);

  const canCreateEditSupplier =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "INVENTORY_STAFF";

  const canDeleteSupplier = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Suppliers</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage suppliers used for purchases and inventory restocking.
          </p>
        </div>

        {canCreateEditSupplier && (
          <button
            type="button"
            onClick={() => {
              setSelectedSupplier(null);
              setIsSupplierModalOpen(true);
            }}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Supplier
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={onSearch} className="flex w-full gap-2 lg:max-w-md">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                placeholder="Search suppliers..."
                className="w-full rounded-lg border border-[#E2E8F0] py-2 pl-10 pr-3 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
              >
                All Suppliers
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {search && (
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                Search: {search}
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

      {suppliersQuery.isPending ? (
        <SuppliersSkeleton />
      ) : suppliersQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {suppliersQuery.error.message}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
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
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#64748B]">
                        <Truck size={32} />
                        <p>No suppliers found.</p>

                        {hasFilters && (
                          <button
                            type="button"
                            onClick={onClearFilters}
                            className="mt-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
                          >
                            Back to all suppliers
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-t border-[#E2E8F0]">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#0F172A]">
                          {supplier.name}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-[#64748B]">
                        {supplier.email || "No email"}
                      </td>

                      <td className="px-4 py-3 text-[#64748B]">
                        {supplier.phone || "No phone"}
                      </td>

                      <td className="px-4 py-3 text-[#64748B]">
                        {supplier.address || "No address"}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={supplier.status ?? "ACTIVE"} />
                      </td>

                      <td className="px-4 py-3 text-[#64748B]">
                        {formatDate(supplier.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {canCreateEditSupplier && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setIsSupplierModalOpen(true);
                              }}
                              className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                            >
                              Edit
                            </button>
                          )}

                          {canDeleteSupplier && (
                            <button
                              type="button"
                              onClick={() => setSupplierToDelete(supplier)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E2E8F0] px-4 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#64748B]">
              Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1} ·{" "}
              {pagination?.total ?? 0} suppliers
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
      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        supplier={selectedSupplier}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setSelectedSupplier(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!supplierToDelete}
        title="Deactivate Supplier"
        description={`Are you sure you want to deactivate "${
          supplierToDelete?.name ?? "this supplier"
        }"?`}
        isDeleting={deleteSupplierMutation.isPending}
        error={
          deleteSupplierMutation.isError
            ? deleteSupplierMutation.error.message
            : undefined
        }
        onClose={() => {
          setSupplierToDelete(null);
          deleteSupplierMutation.reset();
        }}
        onConfirm={() => {
          if (!supplierToDelete) return;
          deleteSupplierMutation.mutate(supplierToDelete.id);
        }}
      />
    </div>
  );
}
