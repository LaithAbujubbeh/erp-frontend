import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

import {
  createExpense,
  updateExpense,
  type CreateExpenseInput,
  type Expense,
} from "../../api/expenses";

type ExpenseFormModalProps = {
  isOpen: boolean;
  expense?: Expense | null;
  onClose: () => void;
};

function getDateInputValue(date?: string | null) {
  if (!date) return new Date().toISOString().slice(0, 10);
  return new Date(date).toISOString().slice(0, 10);
}

export default function ExpenseFormModal({
  isOpen,
  expense,
  onClose,
}: ExpenseFormModalProps) {
  const queryClient = useQueryClient();

  const isEditMode = Boolean(expense);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(getDateInputValue());
  const [formError, setFormError] = useState("");

  const saveExpenseMutation = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CreateExpenseInput }) => {
      if (id) return updateExpense(id, input);
      return createExpense(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      handleClose();
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    setTitle(expense?.title ?? "");
    setCategory(expense?.category ?? "");
    setAmount(expense?.amount ? String(expense.amount) : "");
    setDescription(expense?.description ?? "");
    setExpenseDate(getDateInputValue(expense?.expenseDate));
    setFormError("");
    saveExpenseMutation.reset();
  }, [isOpen, expense]);

  function handleClose() {
    setTitle("");
    setCategory("");
    setAmount("");
    setDescription("");
    setExpenseDate(getDateInputValue());
    setFormError("");
    saveExpenseMutation.reset();
    onClose();
  }

  function validateForm() {
    if (!title.trim()) return "Expense title is required";
    if (!category.trim()) return "Expense category is required";

    const amountNumber = Number(amount);

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return "Amount must be greater than 0";
    }

    if (!expenseDate) return "Expense date is required";

    return "";
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const error = validateForm();

    if (error) {
      setFormError(error);
      return;
    }

    setFormError("");

    saveExpenseMutation.mutate({
      id: expense?.id,
      input: {
        title: title.trim(),
        category: category.trim(),
        amount: Number(amount),
        description: description.trim() || undefined,
        expenseDate,
      },
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              {isEditMode ? "Edit Expense" : "Add Expense"}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {isEditMode
                ? "Update this expense record."
                : "Create a new business expense."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {(formError || saveExpenseMutation.isError) && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {formError ||
                saveExpenseMutation.error?.message ||
                "Failed to save expense"}
            </div>
          )}

          <div>
            <label
              htmlFor="expense-title"
              className="mb-1 block text-sm font-semibold text-[#0F172A]"
            >
              Title
            </label>

            <input
              id="expense-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Office rent"
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="expense-category"
                className="mb-1 block text-sm font-semibold text-[#0F172A]"
              >
                Category
              </label>

              <input
                id="expense-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Rent, Utilities, Salaries..."
                className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label
                htmlFor="expense-amount"
                className="mb-1 block text-sm font-semibold text-[#0F172A]"
              >
                Amount
              </label>

              <input
                id="expense-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="expense-date"
              className="mb-1 block text-sm font-semibold text-[#0F172A]"
            >
              Expense Date
            </label>

            <input
              id="expense-date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label
              htmlFor="expense-description"
              className="mb-1 block text-sm font-semibold text-[#0F172A]"
            >
              Description
            </label>

            <textarea
              id="expense-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes about this expense..."
              rows={3}
              className="w-full resize-none rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={saveExpenseMutation.isPending}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saveExpenseMutation.isPending}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveExpenseMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Expense"
                  : "Create Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
