const API_URL = import.meta.env.VITE_API_URL;

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";

export type Order = {
  id: string;
  customerId?: string | null;
  userId: string;
  subtotal: number | string;
  total: number | string;
  status: OrderStatus;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;

  customer?: {
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
    orderId: string;
    quantity: number;
    unitPrice: number | string;
    totalPrice: number | string;
    product?: {
      id: string;
      name: string;
      sku: string;
      quantity?: number;
      status?: string;
      sellingPrice?: number | string;
    };
  }[];
};

export type OrdersParams = {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type OrdersResult = {
  orders: Order[];
  pagination: Pagination;
};

export type CreateOrderInput = {
  customerId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export async function getOrders(params: OrdersParams): Promise<OrdersResult> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.customerId) {
    searchParams.set("customerId", params.customerId);
  }

  const res = await fetch(`${API_URL}/orders?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get orders");
  }

  return {
    orders: data.data ?? [],
    pagination: data.pagination ?? {
      total: data.data?.length ?? 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 1,
    },
  };
}

export async function getOrder(id: string) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get order");
  }

  return data;
}

export async function createOrder(input: CreateOrderInput) {
  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create order");
  }

  return data;
}

export async function updateOrderStatus(
  id: string,
  status: "PAID" | "CANCELLED",
) {
  const res = await fetch(`${API_URL}/orders/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update order status");
  }

  return data;
}

export async function cancelOrder(id: string) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to cancel order");
  }

  return data;
}
