import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";

import { createPurchase } from "../../api/purchases";
import { getProducts } from "../../api/products";
import { getSuppliers } from "../../api/suppliers";

type PurchaseFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type PurchaseItemInput = {
  productId: string;
  quantity: string;
  unitCost: string;
};

const emptyItem: PurchaseItemInput = {
  productId: "",
  quantity: "1",
  unitCost: "",
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

export default function PurchaseFormModal({
  isOpen,
  onClose,
}: PurchaseFormModalProps) {
  const queryClient = useQueryClient();

  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<PurchaseItemInput[]>([{ ...emptyItem }]);
  const [formError, setFormError] = useState("");

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", "purchase-modal"],
    queryFn: () =>
      getSuppliers({
        page: 1,
        limit: 50,
        status: "ACTIVE",
      }),
    enabled: isOpen,
  });

  const productsQuery = useQuery({
    queryKey: ["products", "purchase-modal"],
    queryFn: () =>
      getProducts({
        page: 1,
        limit: 50,
        status: "ACTIVE",
      }),
    enabled: isOpen,
  });

  const createPurchaseMutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchases"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });

      handleClose();
    },
  });

  const suppliers = suppliersQuery.data?.suppliers ?? [];
  const products = productsQuery.data?.products ?? [];

  const hasNoProducts = !productsQuery.isPending && products.length === 0;

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unitCost);

      if (!Number.isFinite(quantity) || !Number.isFinite(unitCost)) {
        return sum;
      }

      return sum + quantity * unitCost;
    }, 0);
  }, [items]);

  function handleClose() {
    setSupplierId("");
    setItems([{ ...emptyItem }]);
    setFormError("");
    createPurchaseMutation.reset();
    onClose();
  }

  function handleAddItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function handleRemoveItem(index: number) {
    setItems((prev) => {
      if (prev.length === 1) return prev;

      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function handleItemChange(
    index: number,
    field: keyof PurchaseItemInput,
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === "productId") {
          const selectedProduct = products.find(
            (product) => product.id === value,
          );

          return {
            ...item,
            productId: value,
            unitCost: selectedProduct?.buyingPrice
              ? String(selectedProduct.buyingPrice)
              : item.unitCost,
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  }

  function validateForm() {
    if (items.length === 0) {
      return "Add at least one purchase item";
    }

    for (const item of items) {
      if (!item.productId) {
        return "Each item must have a product";
      }

      if (!item.quantity || Number(item.quantity) <= 0) {
        return "Quantity must be greater than 0";
      }

      if (!item.unitCost || Number(item.unitCost) < 0) {
        return "Unit cost must be 0 or greater";
      }
    }

    return "";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const error = validateForm();

    if (error) {
      setFormError(error);
      return;
    }

    setFormError("");

    createPurchaseMutation.mutate({
      supplierId: supplierId || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitCost: Number(item.unitCost),
      })),
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Add Purchase</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Create a supplier purchase with one or more products.
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

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {(formError || createPurchaseMutation.isError) && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {formError ||
                createPurchaseMutation.error?.message ||
                "Failed to create purchase"}
            </div>
          )}

          {hasNoProducts && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              You need at least one active product before creating a purchase.
            </div>
          )}

          <div>
            <label
              htmlFor="purchase-supplier"
              className="mb-1 block text-sm font-semibold text-[#0F172A]"
            >
              Supplier
            </label>

            <select
              id="purchase-supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={suppliersQuery.isPending}
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {suppliersQuery.isPending
                  ? "Loading suppliers..."
                  : "No supplier"}
              </option>

              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs ml-5 text-[#64748B]">
              Supplier is optional
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
              <div>
                <h3 className="font-semibold text-[#0F172A]">Purchase Items</h3>
                <p className="text-xs text-[#64748B]">
                  Select products, quantities, and unit costs.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                disabled={hasNoProducts}
                className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            <div className="space-y-4 p-4">
              {items.map((item, index) => {
                const rowTotal =
                  Number(item.quantity || 0) * Number(item.unitCost || 0);

                return (
                  <div
                    key={index}
                    className="grid gap-3 rounded-xl border border-[#E2E8F0] p-4 lg:grid-cols-[1fr_120px_140px_120px_auto]"
                  >
                    <div>
                      <label
                        htmlFor={`purchase-item-${index}-product`}
                        className="mb-1 block text-xs font-semibold text-[#64748B]"
                      >
                        Product
                      </label>

                      <select
                        id={`purchase-item-${index}-product`}
                        value={item.productId}
                        onChange={(e) =>
                          handleItemChange(index, "productId", e.target.value)
                        }
                        disabled={productsQuery.isPending || hasNoProducts}
                        className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {productsQuery.isPending
                            ? "Loading products..."
                            : "Select product"}
                        </option>

                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} — {product.sku}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`purchase-item-${index}-quantity`}
                        className="mb-1 block text-xs font-semibold text-[#64748B]"
                      >
                        Quantity
                      </label>

                      <input
                        id={`purchase-item-${index}-quantity`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`purchase-item-${index}-unit-cost`}
                        className="mb-1 block text-xs font-semibold text-[#64748B]"
                      >
                        Unit Cost
                      </label>

                      <input
                        id={`purchase-item-${index}-unit-cost`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) =>
                          handleItemChange(index, "unitCost", e.target.value)
                        }
                        className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#64748B]">
                        Total
                      </label>

                      <div className="rounded-lg border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-sm font-semibold text-[#0F172A]">
                        {formatCurrency(rowTotal)}
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-[#E2E8F0] px-4 py-3">
              <div className="text-right">
                <p className="text-sm text-[#64748B]">Subtotal / Total</p>
                <p className="text-xl font-bold text-[#0F172A]">
                  {formatCurrency(subtotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={createPurchaseMutation.isPending}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                createPurchaseMutation.isPending ||
                productsQuery.isPending ||
                hasNoProducts
              }
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createPurchaseMutation.isPending
                ? "Creating..."
                : "Create Purchase"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
