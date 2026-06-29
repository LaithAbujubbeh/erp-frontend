import { useQuery } from "@tanstack/react-query";
import { BarChart3, Search } from "lucide-react";
import type { FormEvent } from "react";

import {
  getExpensesReport,
  getProfitReport,
  getPurchasesReport,
  getSalesReport,
} from "../../api/reports";

type ReportsContentProps = {
  startDate: string;
  endDate: string;
  category: string;
  categoryInput: string;
  onCategoryInputChange: (value: string) => void;
  onCategorySearch: (e: FormEvent<HTMLFormElement>) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearFilters: () => void;
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

function SummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#64748B]">{title}</p>
      <p className="mt-2 text-2xl font-bold text-[#0F172A]">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-[#64748B]">{subtitle}</p>}
    </div>
  );
}

export default function ReportsContent({
  startDate,
  endDate,
  category,
  categoryInput,
  onCategoryInputChange,
  onCategorySearch,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: ReportsContentProps) {
  const reportParams = {
    startDate,
    endDate,
  };

  const salesQuery = useQuery({
    queryKey: ["reports", "sales", reportParams],
    queryFn: () => getSalesReport(reportParams),
  });

  const purchasesQuery = useQuery({
    queryKey: ["reports", "purchases", reportParams],
    queryFn: () => getPurchasesReport(reportParams),
  });

  const expensesQuery = useQuery({
    queryKey: ["reports", "expenses", { startDate, endDate, category }],
    queryFn: () =>
      getExpensesReport({
        startDate,
        endDate,
        category,
      }),
  });

  const profitQuery = useQuery({
    queryKey: ["reports", "profit", reportParams],
    queryFn: () => getProfitReport(reportParams),
  });

  const isLoading =
    salesQuery.isPending ||
    purchasesQuery.isPending ||
    expensesQuery.isPending ||
    profitQuery.isPending;

  const error =
    salesQuery.error ||
    purchasesQuery.error ||
    expensesQuery.error ||
    profitQuery.error;

  const hasFilters = Boolean(startDate || endDate || category);

  const sales = salesQuery.data;
  const purchases = purchasesQuery.data;
  const expenses = expensesQuery.data;
  const profit = profitQuery.data;

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Reports</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          View sales, purchases, expenses, and profit reports.
        </p>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
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

          <form onSubmit={onCategorySearch} className="flex flex-col">
            <label className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Expense Category
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={categoryInput}
                  onChange={(e) => onCategoryInputChange(e.target.value)}
                  placeholder="Rent, salary..."
                  className="w-full rounded-lg border border-[#E2E8F0] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </form>

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
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
          Loading reports...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error.message}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              title="Revenue"
              value={formatCurrency(profit?.summary.totalRevenue)}
              subtitle={`${profit?.counts.paidOrders ?? 0} paid orders`}
            />

            <SummaryCard
              title="Purchase Cost"
              value={formatCurrency(profit?.summary.totalPurchaseCost)}
              subtitle={`${profit?.counts.receivedPurchases ?? 0} received purchases`}
            />

            <SummaryCard
              title="Expenses"
              value={formatCurrency(profit?.summary.totalExpenses)}
              subtitle={`${profit?.counts.activeExpenses ?? 0} active expenses`}
            />

            <SummaryCard
              title="Gross Profit"
              value={formatCurrency(profit?.summary.grossProfit)}
            />

            <SummaryCard
              title="Net Profit"
              value={formatCurrency(profit?.summary.netProfit)}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-[#2563EB]" />
                <h2 className="font-bold text-[#0F172A]">Sales Report</h2>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <SummaryCard
                  title="Total Revenue"
                  value={formatCurrency(sales?.summary.totalRevenue)}
                />
                <SummaryCard
                  title="Orders"
                  value={String(sales?.summary.totalOrders ?? 0)}
                />
                <SummaryCard
                  title="Items Sold"
                  value={String(sales?.summary.totalItemsSold ?? 0)}
                />
              </div>

              <div className="mt-5">
                <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">
                  Top Selling Products
                </h3>

                <div className="space-y-2">
                  {sales?.topSellingProducts.length ? (
                    sales.topSellingProducts.map((product) => (
                      <div
                        key={product.productId}
                        className="flex justify-between rounded-lg border border-[#E2E8F0] p-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-[#0F172A]">
                            {product.productName}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            SKU: {product.sku}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-[#0F172A]">
                            {product.quantitySold} sold
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {formatCurrency(product.totalSales)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#64748B]">
                      No sales data found.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-[#2563EB]" />
                <h2 className="font-bold text-[#0F172A]">Purchases Report</h2>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <SummaryCard
                  title="Purchase Cost"
                  value={formatCurrency(purchases?.summary.totalPurchaseCost)}
                />
                <SummaryCard
                  title="Purchases"
                  value={String(purchases?.summary.totalPurchases ?? 0)}
                />
                <SummaryCard
                  title="Items Purchased"
                  value={String(purchases?.summary.totalItemsPurchased ?? 0)}
                />
              </div>

              <div className="mt-5">
                <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">
                  Top Purchased Products
                </h3>

                <div className="space-y-2">
                  {purchases?.topPurchasedProducts.length ? (
                    purchases.topPurchasedProducts.map((product) => (
                      <div
                        key={product.productId}
                        className="flex justify-between rounded-lg border border-[#E2E8F0] p-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-[#0F172A]">
                            {product.productName}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            SKU: {product.sku}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-[#0F172A]">
                            {product.quantityPurchased} bought
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {formatCurrency(product.totalCost)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#64748B]">
                      No purchase data found.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-[#2563EB]" />
                <h2 className="font-bold text-[#0F172A]">Expenses Report</h2>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <SummaryCard
                  title="Total Expenses"
                  value={formatCurrency(expenses?.summary.totalExpenses)}
                />
                <SummaryCard
                  title="Expense Count"
                  value={String(expenses?.summary.totalExpenseCount ?? 0)}
                />
              </div>

              <div className="mt-5">
                <h3 className="mb-3 text-sm font-semibold text-[#0F172A]">
                  Expenses By Category
                </h3>

                <div className="space-y-2">
                  {expenses?.expensesByCategory.length ? (
                    expenses.expensesByCategory.map((item) => (
                      <div
                        key={item.category}
                        className="flex justify-between rounded-lg border border-[#E2E8F0] p-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-[#0F172A]">
                            {item.category}
                          </p>
                          <p className="text-xs text-[#64748B]">
                            {item.totalCount} expenses
                          </p>
                        </div>

                        <p className="font-semibold text-[#0F172A]">
                          {formatCurrency(item.totalExpenses)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#64748B]">
                      No expense data found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
