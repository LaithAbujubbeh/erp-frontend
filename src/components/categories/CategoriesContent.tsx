import { FolderTree, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import {
  deleteCategory,
  getCategories,
  type Category,
} from "../../api/categories";
import CategoriesSkeleton from "./CategoriesSkeleton";
import { useAuth } from "../../hooks/useAuth";
import DeleteConfirmModal from "../DeleteConfirmModal";
import CategoryFormModal from "./CategoryFormModal";

type CategoriesContentProps = {
  search: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (e: FormEvent<HTMLFormElement>) => void;
  onClearFilters: () => void;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CategoriesContent({
  search,
  searchInput,
  onSearchInputChange,
  onSearch,
  onClearFilters,
}: CategoriesContentProps) {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const hasFilters = Boolean(search);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  const canCreateEditCategory =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "INVENTORY_STAFF";

  const canDeleteCategory = user?.role === "ADMIN" || user?.role === "MANAGER";

  const categories =
    categoriesQuery.data?.filter((category) => {
      const value = search.toLowerCase();

      return (
        category.name.toLowerCase().includes(value) ||
        category.description?.toLowerCase().includes(value)
      );
    }) ?? [];

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryToDelete(null);
    },
  });

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Categories</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage product categories used across your inventory.
          </p>
        </div>

        {canCreateEditCategory && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              setIsCategoryModalOpen(true);
            }}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add Category
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={onSearch} className="flex w-full gap-2 md:max-w-md">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-lg border border-[#E2E8F0] py-2 pl-10 pr-3 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          {hasFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
            >
              All Categories
            </button>
          )}
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
              Search: {search}
            </span>
          </div>
        )}
      </div>

      {categoriesQuery.isPending ? (
        <CategoriesSkeleton />
      ) : categoriesQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {categoriesQuery.error.message}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#64748B]">
                        <FolderTree size={32} />
                        <p>No categories found.</p>

                        {hasFilters && (
                          <button
                            type="button"
                            onClick={onClearFilters}
                            className="mt-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
                          >
                            Back to all categories
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="border-t border-[#E2E8F0]">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#0F172A]">
                          {category.name}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-[#64748B]">
                        {category.description || "No description"}
                      </td>

                      <td className="px-4 py-3 text-[#64748B]">
                        {formatDate(category.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {canCreateEditCategory && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsCategoryModalOpen(true);
                              }}
                              className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                            >
                              Edit
                            </button>
                          )}

                          {canDeleteCategory && (
                            <button
                              type="button"
                              onClick={() => setCategoryToDelete(category)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Deactivate
                            </button>
                          )}

                          {!canCreateEditCategory && !canDeleteCategory && (
                            <span className="text-xs text-[#64748B]">
                              View only
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#E2E8F0] px-4 py-4">
            <p className="text-sm text-[#64748B]">
              Showing {categories.length} of {categoriesQuery.data.length}{" "}
              categories
            </p>
          </div>
        </div>
      )}

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        category={selectedCategory}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!categoryToDelete}
        title="Deactivate Category"
        description={`Are you sure you want to deactivate "${
          categoryToDelete?.name ?? "this category"
        }"?`}
        isDeleting={deleteCategoryMutation.isPending}
        error={
          deleteCategoryMutation.isError
            ? deleteCategoryMutation.error.message
            : undefined
        }
        onClose={() => {
          setCategoryToDelete(null);
          deleteCategoryMutation.reset();
        }}
        onConfirm={() => {
          if (!categoryToDelete) return;
          deleteCategoryMutation.mutate(categoryToDelete.id);
        }}
      />
    </div>
  );
}
