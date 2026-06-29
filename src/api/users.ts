const API_URL = import.meta.env.VITE_API_URL;

export type UserRole = "ADMIN" | "MANAGER" | "CASHIER" | "INVENTORY_STAFF";
export type UserStatus = "ACTIVE" | "INACTIVE";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type UsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UsersResult = {
  users: AppUser[];
  pagination: Pagination;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export async function getUsers(params: UsersParams): Promise<UsersResult> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.search) searchParams.set("search", params.search);
  if (params.role) searchParams.set("role", params.role);
  if (params.status) searchParams.set("status", params.status);

  const res = await fetch(`${API_URL}/users?${searchParams.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get users");
  }

  return {
    users: data.data ?? [],
    pagination: data.pagination ?? {
      total: data.data?.length ?? 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      totalPages: 1,
    },
  };
}

export async function getUser(id: string) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get user");
  }

  return data;
}

export async function createUser(input: CreateUserInput) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create user");
  }

  return data;
}

export async function updateUserRole(id: string, role: UserRole) {
  const res = await fetch(`${API_URL}/users/${id}/role`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update user role");
  }

  return data;
}

export async function updateUserStatus(id: string, status: UserStatus) {
  const res = await fetch(`${API_URL}/users/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update user status");
  }

  return data;
}

export async function deactivateUser(id: string) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to deactivate user");
  }

  return data;
}
