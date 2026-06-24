import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import RoleGuard from "../../components/RoleGuard";
import CategoriesContent from "../../components/categories/CategoriesContent";

export const Route = createFileRoute("/(pages)/categories")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      search: typeof search.search === "string" ? search.search : "",
    };
  },
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <RoleGuard
      allowedRoles={["ADMIN", "MANAGER", "CASHIER", "INVENTORY_STAFF"]}
    >
      <CategoriesRouteState />
    </RoleGuard>
  );
}

function CategoriesRouteState() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const search = searchParams.search;
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    navigate({
      search: {
        search: searchInput.trim(),
      },
    });
  }

  function handleClearFilters() {
    setSearchInput("");

    navigate({
      search: {
        search: "",
      },
    });
  }

  return (
    <CategoriesContent
      search={search}
      searchInput={searchInput}
      onSearchInputChange={setSearchInput}
      onSearch={handleSearch}
      onClearFilters={handleClearFilters}
    />
  );
}
