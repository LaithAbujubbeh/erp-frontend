import { createFileRoute } from "@tanstack/react-router";

import RoleGuard from "../../components/RoleGuard";
import OrdersContent from "../../components/orders/OrdersContent";

const validStatuses = ["", "PENDING", "PAID", "CANCELLED", "REFUNDED"] as const;

type OrderStatusSearch = (typeof validStatuses)[number];

export const Route = createFileRoute("/(pages)/orders")({
  validateSearch: (search: Record<string, unknown>) => {
    const status =
      typeof search.status === "string" &&
      validStatuses.includes(search.status as OrderStatusSearch)
        ? search.status
        : "";

    return {
      page: Number(search.page) || 1,
      status,
      customerId:
        typeof search.customerId === "string" ? search.customerId : "",
    };
  },
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER", "CASHIER"]}>
      <OrdersRouteState />
    </RoleGuard>
  );
}

function OrdersRouteState() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const page = searchParams.page;
  const status = searchParams.status;
  const customerId = searchParams.customerId;

  function handleStatusChange(value: string) {
    navigate({
      search: {
        page: 1,
        status: value,
        customerId,
      },
    });
  }

  function handleCustomerChange(value: string) {
    navigate({
      search: {
        page: 1,
        status,
        customerId: value,
      },
    });
  }

  function handleClearFilters() {
    navigate({
      search: {
        page: 1,
        status: "",
        customerId: "",
      },
    });
  }

  function handlePageChange(nextPage: number) {
    navigate({
      search: {
        page: nextPage,
        status,
        customerId,
      },
    });
  }

  return (
    <OrdersContent
      page={page}
      status={status}
      customerId={customerId}
      onStatusChange={handleStatusChange}
      onCustomerChange={handleCustomerChange}
      onClearFilters={handleClearFilters}
      onPageChange={handlePageChange}
    />
  );
}
