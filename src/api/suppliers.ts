const API_URL = import.meta.env.VITE_API_URL;

export type SupplierStatus = "ACTIVE" | "INACTIVE";

export type Supplier = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: SupplierStatus;
  createdAt: string;
  updatedAt: string;
};

export type SuppliersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export type CreateSupplierInput = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type UpdateSupplierInput = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: SupplierStatus;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SuppliersResult = {
  suppliers: Supplier[];
  pagination: Pagination;
};

export async function getSuppliers(
  params: SuppliersParams,
): Promise<SuppliersResult> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  const res = await fetch(`${API_URL}/suppliers?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get suppliers");
  }

  return {
    suppliers: data.data ?? [],
    pagination: data.pagination ?? {
      total: data.data?.length ?? 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 1,
    },
  };
}

export async function createSupplier(input: CreateSupplierInput) {
  const res = await fetch(`${API_URL}/suppliers`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create supplier");
  }

  return data;
}

export async function updateSupplier(id: string, input: UpdateSupplierInput) {
  const res = await fetch(`${API_URL}/suppliers/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update supplier");
  }

  return data;
}

export async function deleteSupplier(id: string) {
  const res = await fetch(`${API_URL}/suppliers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (res.status === 204) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete supplier");
  }

  return data;
}
