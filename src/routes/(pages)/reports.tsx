import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import RoleGuard from "../../components/RoleGuard";
import ReportsContent from "../../components/reports/ReportsContent";

export const Route = createFileRoute("/(pages)/reports")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      startDate: typeof search.startDate === "string" ? search.startDate : "",
      endDate: typeof search.endDate === "string" ? search.endDate : "",
      category: typeof search.category === "string" ? search.category : "",
    };
  },
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <ReportsRouteState />
    </RoleGuard>
  );
}

function ReportsRouteState() {
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;
  const category = searchParams.category;

  const [categoryInput, setCategoryInput] = useState(category);

  useEffect(() => {
    setCategoryInput(category);
  }, [category]);

  function handleStartDateChange(value: string) {
    navigate({
      search: {
        startDate: value,
        endDate,
        category,
      },
    });
  }

  function handleEndDateChange(value: string) {
    navigate({
      search: {
        startDate,
        endDate: value,
        category,
      },
    });
  }

  function handleCategorySearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    navigate({
      search: {
        startDate,
        endDate,
        category: categoryInput.trim(),
      },
    });
  }

  function handleClearFilters() {
    setCategoryInput("");

    navigate({
      search: {
        startDate: "",
        endDate: "",
        category: "",
      },
    });
  }

  return (
    <ReportsContent
      startDate={startDate}
      endDate={endDate}
      category={category}
      categoryInput={categoryInput}
      onCategoryInputChange={setCategoryInput}
      onCategorySearch={handleCategorySearch}
      onStartDateChange={handleStartDateChange}
      onEndDateChange={handleEndDateChange}
      onClearFilters={handleClearFilters}
    />
  );
}
