import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { type Product, getProducts, deleteProduct } from "../../api/products";
import { useAuth } from "../../hooks/useAuth";
import DeleteConfirmModal from "../DeleteConfirmModal";
import ProductFormModal from "./ProductFormModal";
import ProductsTableSkeleton from "./ProductsTableSkeleton";
import StatusBadge from "../StatusBadge";
import { getCategories } from "../../api/categories";

type ProductsContentProps = {
  page: number;
  search: string;
  status: string;
  categoryId: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (e: FormEvent<HTMLFormElement>) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
};

function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function ProductsContent({
  page,
  search,
  status,
  categoryId,
  searchInput,
  onSearchInputChange,
  onSearch,
  onStatusChange,
  onCategoryChange,
  onClearFilters,
  onPageChange,
}: ProductsContentProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const hasFilters = Boolean(search || status || categoryId);
  const canDeleteProduct = user?.role === "ADMIN" || user?.role === "MANAGER";

  const productsQuery = useQuery({
    queryKey: ["products", { page, search, status, categoryId }],
    queryFn: () =>
      getProducts({
        page,
        limit: 10,
        search,
        status,
        categoryId,
      }),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setProductToDelete(null);
    },
  });

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Products</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage inventory products, stock, prices, and statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedProduct(null);
            setIsProductModalOpen(true);
          }}
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={onSearch} className="flex w-full gap-2 lg:max-w-md">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchInput}
                onChange={(e) => onSearchInputChange(e.target.value)}
                placeholder="Search by name or SKU..."
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              disabled={categoriesQuery.isPending}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {categoriesQuery.isPending
                  ? "Loading categories..."
                  : "All Categories"}
              </option>

              {categoriesQuery.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
              >
                All Products
              </button>
            )}
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {search && (
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                Search: {search}
              </span>
            )}

            {status && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                Status: {status}
              </span>
            )}
            {categoryId && (
              <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700">
                Category:{" "}
                {categoriesQuery.data?.find(
                  (category) => category.id === categoryId,
                )?.name || "Selected category"}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        {productsQuery.isPending ? (
          <ProductsTableSkeleton />
        ) : productsQuery.isError ? (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {productsQuery.error.message}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Selling Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {productsQuery.data.products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-[#64748B]">
                          <Package size={32} />
                          <p>No products found.</p>

                          {hasFilters && (
                            <button
                              type="button"
                              onClick={onClearFilters}
                              className="mt-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
                            >
                              Back to all products
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    productsQuery.data.products.map((product) => {
                      const stock = product.quantity;

                      return (
                        <tr
                          key={product.id}
                          className="border-t border-[#E2E8F0]"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-[#0F172A]">
                                {product.name}
                              </p>

                              {product.description && (
                                <p className="mt-1 max-w-xs truncate text-xs text-[#64748B]">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-[#64748B]">
                            {product.sku}
                          </td>

                          <td className="px-4 py-3">
                            {product.category?.name || "No category"}
                          </td>

                          <td className="px-4 py-3 font-semibold">
                            {formatCurrency(product.sellingPrice)}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                stock <= product.lowStockThreshold
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {stock}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <StatusBadge status={product.status} />
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsProductModalOpen(true);
                                }}
                                className="rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                              >
                                Edit
                              </button>

                              {canDeleteProduct && (
                                <button
                                  type="button"
                                  onClick={() => setProductToDelete(product)}
                                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  Deactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#E2E8F0] px-4 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[#64748B]">
                Page {productsQuery.data.pagination.page} of{" "}
                {productsQuery.data.pagination.totalPages} ·{" "}
                {productsQuery.data.pagination.total} products
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => onPageChange(page - 1)}
                  className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= productsQuery.data.pagination.totalPages}
                  onClick={() => onPageChange(page + 1)}
                  className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ProductFormModal
        isOpen={isProductModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={!!productToDelete}
        title="Deactivate Product"
        description={`Are you sure you want to Deactivate "${
          productToDelete?.name ?? "this product"
        }"? `}
        isDeleting={deleteProductMutation.isPending}
        error={
          deleteProductMutation.isError
            ? deleteProductMutation.error.message
            : undefined
        }
        onClose={() => {
          setProductToDelete(null);
          deleteProductMutation.reset();
        }}
        onConfirm={() => {
          if (!productToDelete) return;
          deleteProductMutation.mutate(productToDelete.id);
        }}
      />
    </div>
  );
}
