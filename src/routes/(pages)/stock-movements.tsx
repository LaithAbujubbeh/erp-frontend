import { createFileRoute } from "@tanstack/react-router";

import RoleGuard from "../../components/RoleGuard";
import StockContent from "../../components/stock/StockContent";

const validTypes = ["", "IN", "OUT"] as const;
const validReferenceTypes = ["", "PURCHASE", "ORDER"] as const;

type StockTypeSearch = (typeof validTypes)[number];
type ReferenceTypeSearch = (typeof validReferenceTypes)[number];

export const Route = createFileRoute("/(pages)/stock-movements")({
  validateSearch: (search: Record<string, unknown>) => {
    const type =
      typeof search.type === "string" &&
      validTypes.includes(search.type as StockTypeSearch)
        ? search.type
        : "";

    const referenceType =
      typeof search.referenceType === "string" &&
      validReferenceTypes.includes(search.referenceType as ReferenceTypeSearch)
        ? search.referenceType
        : "";

    return {
      page: Number(search.page) || 1,
      type,
      referenceType,
      productId: typeof search.productId === "string" ? search.productId : "",
      startDate: typeof search.startDate === "string" ? search.startDate : "",
      endDate: typeof search.endDate === "string" ? search.endDate : "",
    };
  },
  component: StockPage,
});

function StockPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER", "INVENTORY_STAFF"]}>
      <StockRouteState />
    </RoleGuard>
  );
}

function StockRouteState() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const page = searchParams.page;
  const type = searchParams.type;
  const productId = searchParams.productId;
  const referenceType = searchParams.referenceType;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;

  function handleTypeChange(value: string) {
    navigate({
      search: {
        page: 1,
        type: value,
        productId,
        referenceType,
        startDate,
        endDate,
      },
    });
  }

  function handleProductChange(value: string) {
    navigate({
      search: {
        page: 1,
        type,
        productId: value,
        referenceType,
        startDate,
        endDate,
      },
    });
  }

  function handleReferenceTypeChange(value: string) {
    navigate({
      search: {
        page: 1,
        type,
        productId,
        referenceType: value,
        startDate,
        endDate,
      },
    });
  }

  function handleStartDateChange(value: string) {
    navigate({
      search: {
        page: 1,
        type,
        productId,
        referenceType,
        startDate: value,
        endDate,
      },
    });
  }

  function handleEndDateChange(value: string) {
    navigate({
      search: {
        page: 1,
        type,
        productId,
        referenceType,
        startDate,
        endDate: value,
      },
    });
  }

  function handleClearFilters() {
    navigate({
      search: {
        page: 1,
        type: "",
        productId: "",
        referenceType: "",
        startDate: "",
        endDate: "",
      },
    });
  }

  function handlePageChange(nextPage: number) {
    navigate({
      search: {
        page: nextPage,
        type,
        productId,
        referenceType,
        startDate,
        endDate,
      },
    });
  }

  return (
    <StockContent
      page={page}
      type={type}
      productId={productId}
      referenceType={referenceType}
      startDate={startDate}
      endDate={endDate}
      onTypeChange={handleTypeChange}
      onProductChange={handleProductChange}
      onReferenceTypeChange={handleReferenceTypeChange}
      onStartDateChange={handleStartDateChange}
      onEndDateChange={handleEndDateChange}
      onClearFilters={handleClearFilters}
      onPageChange={handlePageChange}
    />
  );
}
