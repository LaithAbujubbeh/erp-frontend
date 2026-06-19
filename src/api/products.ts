const API_URL = import.meta.env.VITE_API_URL;

export type ProductStatus = "ACTIVE" | "INACTIVE";

export type Product = {
  id: string;
  name: string;
  sku: string;

  buyingPrice: number | string;
  sellingPrice: number | string;

  quantity: number;
  lowStockThreshold: number;

  status: ProductStatus;
  description?: string | null;
  image?: string | null;

  categoryId: string;
  category?: {
    id: string;
    name: string;
  } | null;

  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  sku: string;
  description?: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  categoryId: string;
  status: ProductStatus;
};

export type ProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type ProductsResult = {
  products: Product[];
  pagination: Pagination;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export async function getProducts(
  params: ProductsParams,
): Promise<ProductsResult> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.categoryId) {
    searchParams.set("categoryId", params.categoryId);
  }

  const res = await fetch(`${API_URL}/products?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.errors[0].message || "Failed to get products");
  }

  // This supports both response styles:
  // 1. { data: { products, pagination } }
  // 2. { data: products, pagination }
  const products = Array.isArray(data.data)
    ? data.data
    : (data.data?.products ?? []);

  const pagination = data.data?.pagination ??
    data.pagination ?? {
      total: products.length,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 1,
    };

  return {
    products,
    pagination,
  };
}

export async function createProduct(input: CreateProductInput) {
  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.errors[0].message || "Failed to create product");
  }

  return data as ApiResponse<Product>;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.errors[0].message || "Failed to update product");
  }

  return data as ApiResponse<Product>;
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (res.status === 204) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.errors[0].message || "Failed to delete product");
  }

  return data as ApiResponse<Product>;
}
