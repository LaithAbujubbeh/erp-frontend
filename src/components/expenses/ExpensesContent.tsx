import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Receipt, Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import { cancelExpense, getExpenses, type Expense } from "../../api/expenses";
import DeleteConfirmModal from "../DeleteConfirmModal";
import StatusBadge from "../StatusBadge";
import ExpenseFormModal from "./ExpenseFormModal";
import ExpensesSkeleton from "./ExpensesSkeleton";

type ExpensesContentProps = {
  page: number;
  category: string;
  status: string;
  startDate: string;
  endDate: string;
  categoryInput: string;
  onCategoryInputChange: (value: string) => void;
  onCategorySearch: (e: FormEvent<HTMLFormElement>) => void;
  onStatusChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
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

export default function ExpensesContent({
  page,
  category,
  status,
  startDate,
  endDate,
  categoryInput,
  onCategoryInputChange,
  onCategorySearch,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
  onPageChange,
}: ExpensesContentProps) {
  const queryClient = useQueryClient();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToCancel, setExpenseToCancel] = useState<Expense | null>(null);

  const expensesQuery = useQuery({
    queryKey: ["expenses", { page, category, status, startDate, endDate }],
    queryFn: () =>
      getExpenses({
        page,
        limit: 10,
        category,
        status,
        startDate,
        endDate,
      }),
  });

  const cancelExpenseMutation = useMutation({
    mutationFn: cancelExpense,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setExpenseToCancel(null);
    },
  });

  const expenses = expensesQuery.data?.expenses ?? [];
  const pagination = expensesQuery.data?.pagination;

  const hasFilters = Boolean(
    category || startDate || endDate || status !== "ACTIVE",
  );

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Expenses</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Track business expenses, categories, dates, and cancelled records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedExpense(null);
            setIsExpenseModalOpen(true);
          }}
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Expense
        </button>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <form
            onSubmit={onCategorySearch}
            className="flex w-full gap-2 xl:max-w-md"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={categoryInput}
                onChange={(e) => onCategoryInputChange(e.target.value)}
                placeholder="Search category..."
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

          <div className="grid gap-2  xl:flex xl:items-center">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none mt-auto focus:border-[#2563EB]"
            >
              <option value="ACTIVE">Active</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

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

            {hasFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold mt-auto text-[#0F172A] hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {category && (
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                Category: {category}
              </span>
            )}

            {status !== "ACTIVE" && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                Status: {status}
              </span>
            )}

            {startDate && (
              <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700">
                From: {startDate}
              </span>
            )}

            {endDate && (
              <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700">
                To: {endDate}
              </span>
            )}
          </div>
        )}
      </div>

      {expensesQuery.isPending ? (
        <ExpensesSkeleton />
      ) : expensesQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {expensesQuery.error.message}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">Expense</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Expense Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#64748B]">
                        <Receipt size={32} />
                        <p>No expenses found.</p>

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
                  expenses.map((expense) => {
                    const canEdit = expense.status !== "CANCELLED";
                    const canCancel = expense.status !== "CANCELLED";

                    return (
                      <tr
                        key={expense.id}
                        className="border-t border-[#E2E8F0]"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0F172A]">
                            {expense.title}
                          </p>

                          {expense.description && (
                            <p className="mt-1 max-w-sm truncate text-xs text-[#64748B]">
                              {expense.description}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {expense.category}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#0F172A]">
                          {formatCurrency(expense.amount)}
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {formatDate(expense.expenseDate)}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={expense.status} />
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-[#0F172A]">
                            {expense.createdBy?.name || "Unknown user"}
                          </p>

                          {expense.createdBy?.role && (
                            <p className="mt-1 text-xs text-[#64748B]">
                              {expense.createdBy.role}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedExpense(expense);
                                  setIsExpenseModalOpen(true);
                                }}
                                className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                              >
                                Edit
                              </button>
                            )}

                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => setExpenseToCancel(expense)}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </button>
                            )}

                            {!canEdit && !canCancel && (
                              <span className="text-xs text-[#64748B]">
                                No actions
                              </span>
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
              {pagination?.total ?? 0} expenses
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

      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        expense={selectedExpense}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setSelectedExpense(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!expenseToCancel}
        title="Cancel Expense"
        description={`Cancel expense "${
          expenseToCancel?.title ?? "this expense"
        }"? This will hide it from the active expenses list.`}
        isDeleting={cancelExpenseMutation.isPending}
        error={
          cancelExpenseMutation.isError
            ? cancelExpenseMutation.error.message
            : undefined
        }
        confirmText="Cancel Expense"
        loadingText="Cancelling..."
        variant="danger"
        onClose={() => {
          setExpenseToCancel(null);
          cancelExpenseMutation.reset();
        }}
        onConfirm={() => {
          if (!expenseToCancel) return;
          cancelExpenseMutation.mutate(expenseToCancel.id);
        }}
      />
    </div>
  );
}
