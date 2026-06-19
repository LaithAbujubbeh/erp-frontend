const API_URL = import.meta.env.VITE_API_URL;

export type Category = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export async function getCategories() {
  const res = await fetch(`${API_URL}/categories`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get categories");
  }

  // Supports:
  // { data: categories }
  // or { data: { categories } }
  const categories = Array.isArray(data.data)
    ? data.data
    : (data.data?.categories ?? []);

  return categories as Category[];
}
