const API_URL = import.meta.env.VITE_API_URL;

export type ExpenseStatus = "ACTIVE" | "CANCELLED";

export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number | string;
  description?: string | null;
  expenseDate: string;
  status: ExpenseStatus;
  createdAt: string;
  updatedAt: string;
  createdById: string;

  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type ExpensesParams = {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ExpensesResult = {
  expenses: Expense[];
  pagination: Pagination;
};

export type CreateExpenseInput = {
  title: string;
  category: string;
  amount: number;
  description?: string;
  expenseDate?: string;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export async function getExpenses(
  params: ExpensesParams,
): Promise<ExpensesResult> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.startDate) {
    searchParams.set("startDate", params.startDate);
  }

  if (params.endDate) {
    searchParams.set("endDate", params.endDate);
  }

  const res = await fetch(`${API_URL}/expenses?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get expenses");
  }

  return {
    expenses: data.data ?? [],
    pagination: data.pagination ?? {
      total: data.data?.length ?? 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 1,
    },
  };
}

export async function getExpense(id: string) {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get expense");
  }

  return data;
}

export async function createExpense(input: CreateExpenseInput) {
  const res = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create expense");
  }

  return data;
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update expense");
  }

  return data;
}

export async function cancelExpense(id: string) {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to cancel expense");
  }

  return data;
}
