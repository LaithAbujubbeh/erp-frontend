import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import RoleGuard from "../../components/RoleGuard";
import ExpensesContent from "../../components/expenses/ExpensesContent";

const validStatuses = ["", "ACTIVE", "CANCELLED"] as const;

type ExpenseStatusSearch = (typeof validStatuses)[number];

export const Route = createFileRoute("/(pages)/expenses")({
  validateSearch: (search: Record<string, unknown>) => {
    const status =
      typeof search.status === "string" &&
      validStatuses.includes(search.status as ExpenseStatusSearch)
        ? search.status
        : "ACTIVE";

    return {
      page: Number(search.page) || 1,
      category: typeof search.category === "string" ? search.category : "",
      status,
      startDate: typeof search.startDate === "string" ? search.startDate : "",
      endDate: typeof search.endDate === "string" ? search.endDate : "",
    };
  },
  component: ExpensesPage,
});

function ExpensesPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <ExpensesRouteState />
    </RoleGuard>
  );
}

function ExpensesRouteState() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const page = searchParams.page;
  const category = searchParams.category;
  const status = searchParams.status;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;

  const [categoryInput, setCategoryInput] = useState(category);

  useEffect(() => {
    setCategoryInput(category);
  }, [category]);

  function handleCategorySearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    navigate({
      search: {
        page: 1,
        category: categoryInput.trim(),
        status,
        startDate,
        endDate,
      },
    });
  }

  function handleStatusChange(value: string) {
    navigate({
      search: {
        page: 1,
        category,
        status: value,
        startDate,
        endDate,
      },
    });
  }

  function handleStartDateChange(value: string) {
    navigate({
      search: {
        page: 1,
        category,
        status,
        startDate: value,
        endDate,
      },
    });
  }

  function handleEndDateChange(value: string) {
    navigate({
      search: {
        page: 1,
        category,
        status,
        startDate,
        endDate: value,
      },
    });
  }

  function handleClearFilters() {
    setCategoryInput("");

    navigate({
      search: {
        page: 1,
        category: "",
        status: "ACTIVE",
        startDate: "",
        endDate: "",
      },
    });
  }

  function handlePageChange(nextPage: number) {
    navigate({
      search: {
        page: nextPage,
        category,
        status,
        startDate,
        endDate,
      },
    });
  }

  return (
    <ExpensesContent
      page={page}
      category={category}
      status={status}
      startDate={startDate}
      endDate={endDate}
      categoryInput={categoryInput}
      onCategoryInputChange={setCategoryInput}
      onCategorySearch={handleCategorySearch}
      onStatusChange={handleStatusChange}
      onStartDateChange={handleStartDateChange}
      onEndDateChange={handleEndDateChange}
      onClearFilters={handleClearFilters}
      onPageChange={handlePageChange}
    />
  );
}
