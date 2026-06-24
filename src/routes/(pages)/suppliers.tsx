import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import RoleGuard from "../../components/RoleGuard";
import SuppliersContent from "../../components/suppliers/SuppliersContent";

export const Route = createFileRoute("/(pages)/suppliers")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      search: typeof search.search === "string" ? search.search : "",
      status: typeof search.status === "string" ? search.status : "",
    };
  },
  component: SuppliersPage,
});

function SuppliersPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER", "INVENTORY_STAFF"]}>
      <SuppliersRouteState />
    </RoleGuard>
  );
}

function SuppliersRouteState() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const page = searchParams.page;
  const search = searchParams.search;
  const status = searchParams.status;

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    navigate({
      search: {
        page: 1,
        search: searchInput.trim(),
        status,
      },
    });
  }

  function handleStatusChange(value: string) {
    navigate({
      search: {
        page: 1,
        search,
        status: value,
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
      },
    });
  }

  function handlePageChange(nextPage: number) {
    navigate({
      search: {
        page: nextPage,
        search,
        status,
      },
    });
  }

  return (
    <SuppliersContent
      page={page}
      search={search}
      status={status}
      searchInput={searchInput}
      onSearchInputChange={setSearchInput}
      onSearch={handleSearch}
      onStatusChange={handleStatusChange}
      onClearFilters={handleClearFilters}
      onPageChange={handlePageChange}
    />
  );
}
