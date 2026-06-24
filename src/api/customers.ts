const API_URL = import.meta.env.VITE_API_URL;

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export type Customer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: CustomerStatus;
  createdAt: string;
  updatedAt: string;
};

export type CustomersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CustomersResult = {
  customers: Customer[];
  pagination: Pagination;
};

export type CreateCustomerInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: CustomerStatus;
};

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export async function getCustomers(
  params: CustomersParams,
): Promise<CustomersResult> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  const res = await fetch(`${API_URL}/customers?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get customers");
  }

  return {
    customers: data.data ?? [],
    pagination: data.pagination ?? {
      total: data.data?.length ?? 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 1,
    },
  };
}

export async function createCustomer(input: CreateCustomerInput) {
  const res = await fetch(`${API_URL}/customers`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create customer");
  }

  return data;
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update customer");
  }

  return data;
}

export async function deleteCustomer(id: string) {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (res.status === 204) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete customer");
  }

  return data;
}
