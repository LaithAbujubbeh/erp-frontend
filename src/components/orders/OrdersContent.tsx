import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { useState } from "react";

import {
  cancelOrder,
  getOrders,
  updateOrderStatus,
  type Order,
} from "../../api/orders";
import { getCustomers } from "../../api/customers";
import { useAuth } from "../../hooks/useAuth";
import DeleteConfirmModal from "../DeleteConfirmModal";
import StatusBadge from "../StatusBadge";
import OrderDetailsModal from "./OrderDetailsModal";
import OrderFormModal from "./OrderFormModal";
import OrdersSkeleton from "./OrdersSkeleton";

type OrdersContentProps = {
  page: number;
  status: string;
  customerId: string;
  onStatusChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
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

export default function OrdersContent({
  page,
  status,
  customerId,
  onStatusChange,
  onCustomerChange,
  onClearFilters,
  onPageChange,
}: OrdersContentProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToPay, setOrderToPay] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["orders", { page, status, customerId }],
    queryFn: () =>
      getOrders({
        page,
        limit: 10,
        status,
        customerId,
      }),
  });

  const customersQuery = useQuery({
    queryKey: ["customers", "order-filter"],
    queryFn: () =>
      getCustomers({
        page: 1,
        limit: 50,
        status: "ACTIVE",
      }),
  });

  const payOrderMutation = useMutation({
    mutationFn: (id: string) => updateOrderStatus(id, "PAID"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setOrderToPay(null);
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setOrderToCancel(null);
    },
  });

  const orders = ordersQuery.data?.orders ?? [];
  const pagination = ordersQuery.data?.pagination;
  const customers = customersQuery.data?.customers ?? [];

  const hasFilters = Boolean(status || customerId);

  const canCreateOrder =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "CASHIER";

  const canManageOrder =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "CASHIER";

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Orders</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage customer orders, payments, and outgoing stock.
          </p>
        </div>

        {canCreateOrder && (
          <button
            type="button"
            onClick={() => setIsOrderModalOpen(true)}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Order
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={customerId}
              onChange={(e) => onCustomerChange(e.target.value)}
              disabled={customersQuery.isPending}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {customersQuery.isPending
                  ? "Loading customers..."
                  : "All Customers"}
              </option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
              >
                All Orders
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {customerId && (
              <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700">
                Customer:{" "}
                {customers.find((customer) => customer.id === customerId)
                  ?.name || "Selected customer"}
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

      {ordersQuery.isPending ? (
        <OrdersSkeleton />
      ) : ordersQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {ordersQuery.error.message}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
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
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#64748B]">
                        <ClipboardList size={32} />
                        <p>No orders found.</p>

                        {hasFilters && (
                          <button
                            type="button"
                            onClick={onClearFilters}
                            className="mt-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
                          >
                            Back to all orders
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const canPay =
                      canManageOrder &&
                      order.status !== "PAID" &&
                      order.status !== "CANCELLED" &&
                      order.status !== "REFUNDED";

                    const canCancel =
                      canManageOrder &&
                      order.status !== "PAID" &&
                      order.status !== "CANCELLED" &&
                      order.status !== "REFUNDED";

                    return (
                      <tr key={order.id} className="border-t border-[#E2E8F0]">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0F172A]">
                            #{order.id.slice(0, 8)}
                          </p>

                          {order.paidAt && (
                            <p className="mt-1 text-xs text-[#64748B]">
                              Paid: {formatDate(order.paidAt)}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {order.customer?.name || "No customer"}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-[#0F172A]">
                            {order.user?.name || "Unknown user"}
                          </p>

                          {order.user?.role && (
                            <p className="mt-1 text-xs text-[#64748B]">
                              {order.user.role}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {order.items?.length ?? 0}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#0F172A]">
                          {formatCurrency(order.subtotal)}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#0F172A]">
                          {formatCurrency(order.total)}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                            >
                              View
                            </button>

                            {canPay && (
                              <button
                                type="button"
                                onClick={() => setOrderToPay(order)}
                                className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
                              >
                                Pay
                              </button>
                            )}

                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => setOrderToCancel(order)}
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
              {pagination?.total ?? 0} orders
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

      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      <OrderDetailsModal
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <DeleteConfirmModal
        isOpen={!!orderToPay}
        title="Pay Order"
        description={`Mark order #${
          orderToPay?.id.slice(0, 8) ?? ""
        } as paid? This will decrease product stock and create stock movement records.`}
        isDeleting={payOrderMutation.isPending}
        error={
          payOrderMutation.isError ? payOrderMutation.error.message : undefined
        }
        confirmText="Pay Order"
        loadingText="Paying..."
        variant="success"
        onClose={() => {
          setOrderToPay(null);
          payOrderMutation.reset();
        }}
        onConfirm={() => {
          if (!orderToPay) return;
          payOrderMutation.mutate(orderToPay.id);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!orderToCancel}
        title="Cancel Order"
        description={`Cancel order #${
          orderToCancel?.id.slice(0, 8) ?? ""
        }? This order cannot be paid after cancellation.`}
        isDeleting={cancelOrderMutation.isPending}
        error={
          cancelOrderMutation.isError
            ? cancelOrderMutation.error.message
            : undefined
        }
        confirmText="Cancel Order"
        loadingText="Cancelling..."
        variant="danger"
        onClose={() => {
          setOrderToCancel(null);
          cancelOrderMutation.reset();
        }}
        onConfirm={() => {
          if (!orderToCancel) return;
          cancelOrderMutation.mutate(orderToCancel.id);
        }}
      />
    </div>
  );
}
