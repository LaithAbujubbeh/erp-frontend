import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { useAuth } from "../../hooks/useAuth";

import {
  createProduct,
  updateProduct,
  type CreateProductInput,
  type Product,
} from "../../api/products";
import { getCategories } from "../../api/categories";
import { useEffect } from "react";

type ProductFormModalProps = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
};

type ProductFormValues = {
  name: string;
  sku: string;
  description: string;
  buyingPrice: string;
  sellingPrice: string;
  quantity: string;
  lowStockThreshold: string;
  categoryId: string;
  status: "ACTIVE" | "INACTIVE";
};

const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    sku: z.string().min(1, "SKU is required"),
    description: z.string(),
    buyingPrice: z.string().min(1, "Buying price is required"),
    sellingPrice: z.string().min(1, "Selling price is required"),
    quantity: z.string().min(1, "Quantity is required"),
    lowStockThreshold: z.string().min(1, "Low stock threshold is required"),
    categoryId: z.string().min(1, "Category is required"),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .refine((data) => Number(data.sellingPrice) >= Number(data.buyingPrice), {
    message: "Selling price should be greater than or equal to buying price",
    path: ["sellingPrice"],
  });

const defaultValues: ProductFormValues = {
  name: "",
  sku: "",
  description: "",
  buyingPrice: "",
  sellingPrice: "",
  quantity: "",
  lowStockThreshold: "",
  categoryId: "",
  status: "ACTIVE",
};

function getFormValues(product?: Product): ProductFormValues {
  if (!product) {
    return defaultValues;
  }

  if (!product.category) {
    return defaultValues;
  }
  return {
    name: product.name,
    sku: product.sku,
    description: product.description ?? "",
    buyingPrice: String(product.buyingPrice),
    sellingPrice: String(product.sellingPrice),
    quantity: String(product.quantity),
    lowStockThreshold: String(product.lowStockThreshold),
    categoryId: product.category?.id,
    status: product.status,
  };
}

function getFieldError(errors: unknown[]) {
  if (!errors.length) return null;

  return errors
    .map((error) => {
      if (typeof error === "string") return error;

      if (typeof error === "object" && error !== null && "message" in error) {
        return String(error.message);
      }

      return "Invalid field";
    })
    .join(", ");
}

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
}: ProductFormModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(product);
  const { user } = useAuth();
  const canManageStatus = user?.role === "ADMIN" || user?.role === "MANAGER";

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: isOpen,
  });

  const categories = categoriesQuery.data ?? [];
  const hasNoCategories = !categoriesQuery.isPending && categories.length === 0;

  type SaveProductInput =
    | {
        mode: "create";
        input: CreateProductInput;
      }
    | {
        mode: "update";
        id: string;
        input: Partial<CreateProductInput>;
      };

  const saveProductMutation = useMutation({
    mutationFn: (variables: SaveProductInput) => {
      if (variables.mode === "update") {
        return updateProduct(variables.id, variables.input);
      }

      return createProduct(variables.input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const form = useForm({
    defaultValues,
    validators: {
      onChange: productSchema,
    },
    onSubmit: ({ value }) => {
      if (isEditMode && product?.id) {
        const updateInput: Partial<CreateProductInput> = {
          name: value.name,
          sku: value.sku,
          description: value.description || undefined,
          buyingPrice: Number(value.buyingPrice),
          sellingPrice: Number(value.sellingPrice),
          quantity: Number(value.quantity),
          lowStockThreshold: Number(value.lowStockThreshold),
          categoryId: value.categoryId,
          status: canManageStatus ? value.status : "ACTIVE",
        };

        saveProductMutation.mutate({
          mode: "update",
          id: product.id,
          input: updateInput,
        });

        return;
      }

      const createInput: CreateProductInput = {
        name: value.name,
        sku: value.sku,
        description: value.description || undefined,
        buyingPrice: Number(value.buyingPrice),
        sellingPrice: Number(value.sellingPrice),
        quantity: Number(value.quantity),
        lowStockThreshold: Number(value.lowStockThreshold),
        categoryId: value.categoryId,
        status: canManageStatus ? value.status : "ACTIVE",
      };

      saveProductMutation.mutate({
        mode: "create",
        input: createInput,
      });
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (!product) return;

    const values = getFormValues(product);

    form.setFieldValue("name", values.name);
    form.setFieldValue("sku", values.sku);
    form.setFieldValue("description", values.description);
    form.setFieldValue("buyingPrice", values.buyingPrice);
    form.setFieldValue("sellingPrice", values.sellingPrice);
    form.setFieldValue("quantity", values.quantity);
    form.setFieldValue("lowStockThreshold", values.lowStockThreshold);
    form.setFieldValue("categoryId", values.categoryId);
    form.setFieldValue("status", values.status);
  }, [isOpen, product, form]);

  function handleClose() {
    form.reset();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              {isEditMode ? "Edit Product" : "Add Product"}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {isEditMode
                ? "Update this product details."
                : "Create a new product in your inventory."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5 p-6"
        >
          {saveProductMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {saveProductMutation.error.message}
            </div>
          )}
          {hasNoCategories && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              You need to create at least one category before adding a product.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="name">
              {(field) => (
                <div>
                  <label
                    htmlFor="product-name"
                    className="mb-1 block text-sm font-semibold text-[#0F172A]"
                  >
                    Product Name
                  </label>

                  <input
                    id="product-name"
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="USB-C Cable"
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                  />

                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="sku">
              {(field) => (
                <div>
                  <label
                    htmlFor="sku-name"
                    className="mb-1 block text-sm font-semibold text-[#0F172A]"
                  >
                    SKU
                  </label>

                  <input
                    id="sku-name"
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="USB-C-003"
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                  />

                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="description">
            {(field) => (
              <div>
                <label
                  htmlFor="description-name"
                  className="mb-1 block text-sm font-semibold text-[#0F172A]"
                >
                  Description
                </label>

                <textarea
                  id="description-name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Fast charging cable"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
            )}
          </form.Field>

          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="buyingPrice">
              {(field) => (
                <div>
                  <label
                    htmlFor="buying-price"
                    className="mb-1 block text-sm font-semibold text-[#0F172A]"
                  >
                    Buying Price
                  </label>

                  <input
                    id="buying-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="2.5"
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                  />

                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="sellingPrice">
              {(field) => (
                <div>
                  <label
                    htmlFor="selling-price"
                    className="mb-1 block text-sm font-semibold text-[#0F172A]"
                  >
                    Selling Price
                  </label>

                  <input
                    id="selling-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="6"
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                  />

                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="quantity">
              {(field) => (
                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-1 block text-sm font-semibold text-[#0F172A]"
                  >
                    Quantity
                  </label>

                  <input
                    id="quantity"
                    type="number"
                    min="0"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="85"
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                  />

                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="lowStockThreshold">
              {(field) => (
                <div>
                  <label
                    htmlFor="low-stock"
                    className="mb-1 block text-sm font-semibold text-[#0F172A]"
                  >
                    Low Stock Threshold
                  </label>

                  <input
                    id="low-stock"
                    type="number"
                    min="0"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="10"
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                  />

                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="categoryId">
              {(field) => (
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1 block text-sm font-semibold text-[#0F172A]"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={categoriesQuery.isPending || hasNoCategories}
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {categoriesQuery.isPending
                        ? "Loading categories..."
                        : hasNoCategories
                          ? "No categories available"
                          : "Select category"}
                    </option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-500">
                      {getFieldError(field.state.meta.errors)}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {canManageStatus && (
              <form.Field name="status">
                {(field) => (
                  <div>
                    <label
                      htmlFor="status"
                      className="mb-1 block text-sm font-semibold text-[#0F172A]"
                    >
                      Status
                    </label>

                    <select
                      id="status"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.value as "ACTIVE" | "INACTIVE",
                        )
                      }
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                )}
              </form.Field>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saveProductMutation.isPending ||
                categoriesQuery.isPending ||
                hasNoCategories
              }
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveProductMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Product"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
