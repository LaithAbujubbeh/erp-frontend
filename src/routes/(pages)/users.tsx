import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import RoleGuard from "../../components/RoleGuard";
import UsersContent from "../../components/users/UsersContent";

const validRoles = [
  "",
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "INVENTORY_STAFF",
] as const;
const validStatuses = ["", "ACTIVE", "INACTIVE"] as const;

type UserRoleSearch = (typeof validRoles)[number];
type UserStatusSearch = (typeof validStatuses)[number];

export const Route = createFileRoute("/(pages)/users")({
  validateSearch: (search: Record<string, unknown>) => {
    const role =
      typeof search.role === "string" &&
      validRoles.includes(search.role as UserRoleSearch)
        ? search.role
        : "";

    const status =
      typeof search.status === "string" &&
      validStatuses.includes(search.status as UserStatusSearch)
        ? search.status
        : "";

    return {
      page: Number(search.page) || 1,
      search: typeof search.search === "string" ? search.search : "",
      role,
      status,
    };
  },
  component: UsersPage,
});

function UsersPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <UsersRouteState />
    </RoleGuard>
  );
}

function UsersRouteState() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const page = searchParams.page;
  const search = searchParams.search;
  const role = searchParams.role;
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
        role,
        status,
      },
    });
  }

  function handleRoleChange(value: string) {
    navigate({
      search: {
        page: 1,
        search,
        role: value,
        status,
      },
    });
  }

  function handleStatusChange(value: string) {
    navigate({
      search: {
        page: 1,
        search,
        role,
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
        role: "",
        status: "",
      },
    });
  }

  function handlePageChange(nextPage: number) {
    navigate({
      search: {
        page: nextPage,
        search,
        role,
        status,
      },
    });
  }

  return (
    <UsersContent
      page={page}
      search={search}
      role={role}
      status={status}
      searchInput={searchInput}
      onSearchInputChange={setSearchInput}
      onSearch={handleSearch}
      onRoleChange={handleRoleChange}
      onStatusChange={handleStatusChange}
      onClearFilters={handleClearFilters}
      onPageChange={handlePageChange}
    />
  );
}
