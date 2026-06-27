import { createFileRoute } from "@tanstack/react-router";

import RoleGuard from "../../components/RoleGuard";
import PurchasesContent from "../../components/purchases/PurchasesContent";

const validStatuses = ["", "DRAFT", "RECEIVED", "CANCELLED"] as const;

type PurchaseStatusSearch = (typeof validStatuses)[number];

export const Route = createFileRoute("/(pages)/purchases")({
  validateSearch: (search: Record<string, unknown>) => {
    const status =
      typeof search.status === "string" &&
      validStatuses.includes(search.status as PurchaseStatusSearch)
        ? search.status
        : "";

    return {
      page: Number(search.page) || 1,
      status,
      supplierId:
        typeof search.supplierId === "string" ? search.supplierId : "",
    };
  },
  component: PurchasesPage,
});

function PurchasesPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER", "INVENTORY_STAFF"]}>
      <PurchasesRouteState />
    </RoleGuard>
  );
}

function PurchasesRouteState() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const page = searchParams.page;
  const status = searchParams.status;
  const supplierId = searchParams.supplierId;

  function handleStatusChange(value: string) {
    navigate({
      search: {
        page: 1,
        status: value,
        supplierId,
      },
    });
  }

  function handleSupplierChange(value: string) {
    navigate({
      search: {
        page: 1,
        status,
        supplierId: value,
      },
    });
  }

  function handleClearFilters() {
    navigate({
      search: {
        page: 1,
        status: "",
        supplierId: "",
      },
    });
  }

  function handlePageChange(nextPage: number) {
    navigate({
      search: {
        page: nextPage,
        status,
        supplierId,
      },
    });
  }

  return (
    <PurchasesContent
      page={page}
      status={status}
      supplierId={supplierId}
      onStatusChange={handleStatusChange}
      onSupplierChange={handleSupplierChange}
      onClearFilters={handleClearFilters}
      onPageChange={handlePageChange}
    />
  );
}
