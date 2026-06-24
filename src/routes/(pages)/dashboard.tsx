import { createFileRoute } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  Boxes,
  Handshake,
  Package,
  Receipt,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { getDashboardSummary } from "../../api/dashboard";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { getCustomers } from "../../api/customers";

export const Route = createFileRoute("/(pages)/dashboard")({
  component: RouteComponent,
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function RouteComponent() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  if (dashboardQuery.isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 w-full text-sm text-red-600">
        {dashboardQuery.error.message}
      </div>
    );
  }

  const dashboard = dashboardQuery.data.data;

  return (
    <div className="w-full space-y-8 p-6 overflow-y-scroll">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Overview of your ERP business performance.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboard.financials.totalRevenue)}
          helper="From paid orders"
          icon={TrendingUp}
        />

        <StatCard
          title="Purchase Cost"
          value={formatCurrency(dashboard.financials.totalPurchaseCost)}
          helper="From received purchases"
          icon={TrendingDown}
        />

        <StatCard
          title="Expenses"
          value={formatCurrency(dashboard.financials.totalExpenses)}
          helper="Active expenses"
          icon={Banknote}
        />

        <StatCard
          title="Gross Profit"
          value={formatCurrency(dashboard.financials.grossProfit)}
          helper="Revenue - purchase cost"
          icon={Receipt}
        />

        <StatCard
          title="Net Profit"
          value={formatCurrency(dashboard.financials.netProfit)}
          helper="Gross profit - expenses"
          icon={Boxes}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Orders"
          value={dashboard.counts.totalOrders}
          helper={`${dashboard.counts.paidOrders} paid · ${dashboard.counts.pendingOrders} pending`}
          icon={ShoppingCart}
        />

        <StatCard
          title="Purchases"
          value={dashboard.counts.totalPurchases}
          helper={`${dashboard.counts.receivedPurchases} received`}
          icon={Receipt}
        />

        <StatCard
          title="Products"
          value={dashboard.counts.totalProducts}
          helper={`${dashboard.counts.lowStockProducts} low stock`}
          icon={Package}
        />

        <StatCard
          title="Customers"
          value={dashboard.counts.totalCustomers}
          helper="Total customers"
          icon={Users}
        />

        <StatCard
          title="Suppliers"
          value={dashboard.counts.totalSuppliers}
          helper="Total suppliers"
          icon={Handshake}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#0F172A]">Recent Orders</h2>
              <p className="text-sm text-[#64748B]">
                Latest customer orders in the system.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E2E8F0]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentActivity.recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-[#64748B]"
                    >
                      No recent orders.
                    </td>
                  </tr>
                ) : (
                  dashboard.recentActivity.recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-[#E2E8F0]">
                      <td className="px-4 py-3">
                        {order.customer?.name || "Walk-in Customer"}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {formatCurrency(Number(order.total))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-[#64748B]">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-3 text-amber-600">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h2 className="font-bold text-[#0F172A]">Low Stock Products</h2>
              <p className="text-sm text-[#64748B]">
                Products below threshold.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {dashboard.lowStockProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E2E8F0] p-6 text-center text-sm text-[#64748B]">
                No low stock products.
              </div>
            ) : (
              dashboard.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-[#E2E8F0] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#0F172A]">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#64748B]">
                        SKU: {product.sku}
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {product.quantity} left
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-[#64748B]">
                    Threshold: {product.lowStockThreshold}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-bold text-[#0F172A]">Recent Purchases</h2>
            <p className="text-sm text-[#64748B]">Latest supplier purchases.</p>
          </div>

          <div className="space-y-3">
            {dashboard.recentActivity.recentPurchases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E2E8F0] p-6 text-center text-sm text-[#64748B]">
                No recent purchases.
              </div>
            ) : (
              dashboard.recentActivity.recentPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-4"
                >
                  <div>
                    <p className="font-semibold text-[#0F172A]">
                      {purchase.supplier?.name || "Unknown Supplier"}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {formatDate(purchase.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(Number(purchase.total))}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={purchase.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-bold text-[#0F172A]">Recent Expenses</h2>
            <p className="text-sm text-[#64748B]">
              Latest recorded business expenses.
            </p>
          </div>

          <div className="space-y-3">
            {dashboard.recentActivity.recentExpenses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E2E8F0] p-6 text-center text-sm text-[#64748B]">
                No recent expenses.
              </div>
            ) : (
              dashboard.recentActivity.recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-xl border border-[#E2E8F0] p-4"
                >
                  <div>
                    <p className="font-semibold text-[#0F172A]">
                      {expense.title}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {expense.category} · {formatDate(expense.createdAt)}
                    </p>
                  </div>

                  <p className="font-semibold text-red-600">
                    {formatCurrency(Number(expense.amount))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
