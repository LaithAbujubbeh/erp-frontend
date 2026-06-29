const API_URL = import.meta.env.VITE_API_URL;

export type StockMovementType = "IN" | "OUT";
export type StockReferenceType = "PURCHASE" | "ORDER";

export type StockMovement = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string;
  referenceType: StockReferenceType;
  referenceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;

  product?: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    status: string;
  };

  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type StockMovementsParams = {
  page?: number;
  limit?: number;
  type?: string;
  productId?: string;
  referenceType?: string;
  startDate?: string;
  endDate?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type StockMovementsResult = {
  movements: StockMovement[];
  pagination: Pagination;
};

export async function getStockMovements(
  params: StockMovementsParams,
): Promise<StockMovementsResult> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.type) searchParams.set("type", params.type);
  if (params.productId) searchParams.set("productId", params.productId);
  if (params.referenceType) {
    searchParams.set("referenceType", params.referenceType);
  }
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);

  const res = await fetch(
    `${API_URL}/stock-movements?${searchParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get stock movements");
  }

  return {
    movements: data.data ?? [],
    pagination: data.pagination ?? {
      total: data.data?.length ?? 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 1,
    },
  };
}

export async function getStockMovement(id: string) {
  const res = await fetch(`${API_URL}/stock-movements/${id}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get stock movement");
  }

  return data;
}
