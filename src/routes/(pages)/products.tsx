import { createFileRoute } from "@tanstack/react-router";

import RoleGuard from "../../components/RoleGuard";
import ProductsContent from "../../components/products/ProductsContent";
import { useState, useEffect, type FormEvent } from "react";

export const Route = createFileRoute("/(pages)/products")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      search: typeof search.search === "string" ? search.search : "",
      status: typeof search.status === "string" ? search.status : "",
      categoryId:
        typeof search.categoryId === "string" ? search.categoryId : "",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RoleGuard
      allowedRoles={["ADMIN", "MANAGER", "CASHIER", "INVENTORY_STAFF"]}
    >
      <ProductsRouteState />
    </RoleGuard>
  );
}

function ProductsRouteState() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const page = searchParams.page;
  const search = searchParams.search;
  const status = searchParams.status;
  const categoryId = searchParams.categoryId;

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    navigate({
      search: {
        page: 1,
        search: searchInput,
        status,
        categoryId,
      },
    });
  }

  function handleStatusChange(value: string) {
    navigate({
      search: {
        page: 1,
        search,
        status: value,
        categoryId,
      },
    });
  }

  function handleClearFilters() {
    setSearchInput("");

    navigate({
      search: {
        page: 1,
        search: "",
        status: "",
        categoryId: "",
      },
    });
  }

  function handlePageChange(nextPage: number) {
    navigate({
      search: {
        page: nextPage,
        search,
        status,
        categoryId,
      },
    });
  }

  function handleCategoryChange(value: string) {
    navigate({
      search: {
        page: 1,
        search,
        status,
        categoryId: value,
      },
    });
  }

  return (
    <ProductsContent
      page={page}
      search={search}
      status={status}
      categoryId={categoryId}
      searchInput={searchInput}
      onSearchInputChange={setSearchInput}
      onSearch={handleSearch}
      onStatusChange={handleStatusChange}
      onCategoryChange={handleCategoryChange}
      onClearFilters={handleClearFilters}
      onPageChange={handlePageChange}
    />
  );
}
