import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import RoleGuard from "../../components/RoleGuard";
import CustomersContent from "../../components/customers/CustomersContent";

export const Route = createFileRoute("/(pages)/customers")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: Number(search.page) || 1,
      search: typeof search.search === "string" ? search.search : "",
      status: typeof search.status === "string" ? search.status : "",
    };
  },
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER", "CASHIER"]}>
      <CustomersRouteState />
    </RoleGuard>
  );
}

function CustomersRouteState() {
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
    <CustomersContent
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
