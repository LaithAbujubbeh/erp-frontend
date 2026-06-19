const API_URL = import.meta.env.VITE_API_URL;

export type DashboardSummary = {
  financials: {
    totalRevenue: number;
    totalPurchaseCost: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
  };
  counts: {
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    totalPurchases: number;
    receivedPurchases: number;
    totalProducts: number;
    lowStockProducts: number;
    totalCustomers: number;
    totalSuppliers: number;
  };
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    lowStockThreshold: number;
  }[];
  recentActivity: {
    recentOrders: {
      id: string;
      total: number;
      status: string;
      createdAt: string;
      customer?: {
        name: string;
      } | null;
    }[];
    recentPurchases: {
      id: string;
      total: number;
      status: string;
      createdAt: string;
      supplier?: {
        name: string;
      } | null;
    }[];
    recentExpenses: {
      id: string;
      title: string;
      amount: number;
      category: string;
      createdAt: string;
    }[];
  };
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export async function getDashboardSummary() {
  const res = await fetch(`${API_URL}/dashboard/summary`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to get dashboard summary");
  }

  return data as ApiResponse<DashboardSummary>;
}
