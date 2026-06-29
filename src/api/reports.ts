const API_URL = import.meta.env.VITE_API_URL;

export type ReportParams = {
  startDate?: string;
  endDate?: string;
  category?: string;
};

function buildReportQuery(params: ReportParams) {
  const searchParams = new URLSearchParams();

  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.category) searchParams.set("category", params.category);

  return searchParams.toString();
}

async function fetchReport<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch report");
  }

  return data.data;
}

export type SalesReport = {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalItemsSold: number;
  };
  salesByDate: {
    date: string;
    totalSales: number;
    totalOrders: number;
  }[];
  topSellingProducts: {
    productId: string;
    productName: string;
    sku: string;
    quantitySold: number;
    totalSales: number;
  }[];
  recentPaidOrders: unknown[];
};

export type PurchasesReport = {
  summary: {
    totalPurchaseCost: number;
    totalPurchases: number;
    totalItemsPurchased: number;
  };
  purchasesByDate: {
    date: string;
    totalPurchaseCost: number;
    totalPurchases: number;
  }[];
  topPurchasedProducts: {
    productId: string;
    productName: string;
    sku: string;
    quantityPurchased: number;
    totalCost: number;
  }[];
  recentReceivedPurchases: unknown[];
};

export type ExpensesReport = {
  summary: {
    totalExpenses: number;
    totalExpenseCount: number;
  };
  expensesByDate: {
    date: string;
    totalExpenses: number;
    totalCount: number;
  }[];
  expensesByCategory: {
    category: string;
    totalExpenses: number;
    totalCount: number;
  }[];
  recentExpenses: unknown[];
};

export type ProfitReport = {
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  summary: {
    totalRevenue: number;
    totalPurchaseCost: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
  };
  counts: {
    paidOrders: number;
    receivedPurchases: number;
    activeExpenses: number;
  };
};

export async function getSalesReport(params: ReportParams) {
  const query = buildReportQuery(params);
  return fetchReport<SalesReport>(`${API_URL}/reports/sales?${query}`);
}

export async function getPurchasesReport(params: ReportParams) {
  const query = buildReportQuery(params);
  return fetchReport<PurchasesReport>(`${API_URL}/reports/purchases?${query}`);
}

export async function getExpensesReport(params: ReportParams) {
  const query = buildReportQuery(params);
  return fetchReport<ExpensesReport>(`${API_URL}/reports/expenses?${query}`);
}

export async function getProfitReport(params: ReportParams) {
  const query = buildReportQuery(params);
  return fetchReport<ProfitReport>(`${API_URL}/reports/profit?${query}`);
}
