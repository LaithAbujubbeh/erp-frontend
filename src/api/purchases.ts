const API_URL = import.meta.env.VITE_API_URL;

export type PurchaseStatus = "DRAFT" | "RECEIVED" | "CANCELLED";

export type Purchase = {
  id: string;
  supplierId?: string | null;
  userId: string;
  subtotal: number | string;
  total: number | string;
  status: PurchaseStatus;
  receivedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  supplier?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  } | null;

  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  items?: {
    id: string;
    productId: string;
    purchaseId: string;
    quantity: number;
    unitCost: number | string;
    totalCost: number | string;
    product?: {
      id: string;
      name: string;
      sku: string;
    };
  }[];
};

export type PurchasesParams = {
  page?: number;
  limit?: number;
  status?: string;
  supplierId?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PurchasesResult = {
  purchases: Purchase[];
  pagination: Pagination;
};

export async function getPurchases(
  params: PurchasesParams,
): Promise<PurchasesResult> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.supplierId) {
    searchParams.set("supplierId", params.supplierId);
  }

  const res = await fetch(`${API_URL}/purchases?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get purchases");
  }

  return {
    purchases: data.data ?? [],
    pagination: data.pagination ?? {
      total: data.data?.length ?? 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 1,
    },
  };
}

export async function updatePurchaseStatus(
  id: string,
  status: "RECEIVED" | "CANCELLED",
) {
  const res = await fetch(`${API_URL}/purchases/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update purchase status");
  }

  return data;
}

export async function cancelPurchase(id: string) {
  const res = await fetch(`${API_URL}/purchases/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to cancel purchase");
  }

  return data;
}

export type CreatePurchaseInput = {
  supplierId?: string;
  items: {
    productId: string;
    quantity: number;
    unitCost: number;
  }[];
};

export async function createPurchase(input: CreatePurchaseInput) {
  const res = await fetch(`${API_URL}/purchases`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create purchase");
  }

  return data;
}
