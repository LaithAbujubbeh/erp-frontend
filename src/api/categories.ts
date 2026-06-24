const API_URL = import.meta.env.VITE_API_URL;

export type Category = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
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

  const categories = Array.isArray(data.data)
    ? data.data
    : (data.data?.categories ?? []);

  return categories as Category[];
}
export type CreateCategoryInput = {
  name: string;
  description?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export async function createCategory(input: CreateCategoryInput) {
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create category");
  }

  return data;
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update category");
  }

  return data;
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (res.status === 204) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete category");
  }

  return data;
}
