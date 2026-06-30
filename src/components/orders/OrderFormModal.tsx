import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";

import { createOrder } from "../../api/orders";
import { getCustomers } from "../../api/customers";
import { getProducts } from "../../api/products";

type OrderFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type OrderItemInput = {
  productId: string;
  quantity: string;
  unitPrice: string;
};

const emptyItem: OrderItemInput = {
  productId: "",
  quantity: "1",
  unitPrice: "",
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

export default function OrderFormModal({
  isOpen,
  onClose,
}: OrderFormModalProps) {
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<OrderItemInput[]>([{ ...emptyItem }]);
  const [formError, setFormError] = useState("");

  const customersQuery = useQuery({
    queryKey: ["customers", "order-modal"],
    queryFn: () =>
      getCustomers({
        page: 1,
        limit: 50,
        status: "ACTIVE",
      }),
    enabled: isOpen,
  });

  const productsQuery = useQuery({
    queryKey: ["products", "order-modal"],
    queryFn: () =>
      getProducts({
        page: 1,
        limit: 50,
        status: "ACTIVE",
      }),
    enabled: isOpen,
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });

      handleClose();
    },
  });

  const customers = customersQuery.data?.customers ?? [];
  const products = productsQuery.data?.products ?? [];

  const hasNoProducts = !productsQuery.isPending && products.length === 0;

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);

      if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
        return sum;
      }

      return sum + quantity * unitPrice;
    }, 0);
  }, [items]);

  function handleClose() {
    setCustomerId("");
    setItems([{ ...emptyItem }]);
    setFormError("");
    createOrderMutation.reset();
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
    field: keyof OrderItemInput,
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
            unitPrice: selectedProduct?.sellingPrice
              ? String(selectedProduct.sellingPrice)
              : item.unitPrice,
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
      return "Add at least one order item";
    }

    for (const item of items) {
      if (!item.productId) {
        return "Each item must have a product";
      }

      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return "Quantity must be greater than 0";
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return "Unit price must be 0 or greater";
      }

      const product = products.find((p) => p.id === item.productId);

      if (product && Number(product.quantity) < quantity) {
        return `Not enough stock for product: ${product.name}`;
      }
    }

    return "";
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const error = validateForm();

    if (error) {
      setFormError(error);
      return;
    }

    setFormError("");

    createOrderMutation.mutate({
      customerId: customerId || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Add Order</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Create a customer order with one or more products.
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
          {(formError || createOrderMutation.isError) && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {formError ||
                createOrderMutation.error?.message ||
                "Failed to create order"}
            </div>
          )}

          {hasNoProducts && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              You need at least one active product before creating an order.
            </div>
          )}

          <div>
            <label
              htmlFor="order-customer"
              className="mb-1 block text-sm font-semibold text-[#0F172A]"
            >
              Customer
            </label>

            <select
              id="order-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={customersQuery.isPending}
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {customersQuery.isPending
                  ? "Loading customers..."
                  : "No customer"}
              </option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-[#64748B]">
              Customer is optional based on your backend.
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
              <div>
                <h3 className="font-semibold text-[#0F172A]">Order Items</h3>
                <p className="text-xs text-[#64748B]">
                  Select products, quantities, and selling prices.
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
                const selectedProduct = products.find(
                  (product) => product.id === item.productId,
                );

                const rowTotal =
                  Number(item.quantity || 0) * Number(item.unitPrice || 0);

                return (
                  <div
                    key={index}
                    className="grid gap-3 rounded-xl border border-[#E2E8F0] p-4 lg:grid-cols-[1fr_110px_130px_130px_120px_auto]"
                  >
                    <div>
                      <label
                        htmlFor={`order-item-${index}-product`}
                        className="mb-1 block text-xs font-semibold text-[#64748B]"
                      >
                        Product
                      </label>

                      <select
                        id={`order-item-${index}-product`}
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

                      {selectedProduct && (
                        <p className="mt-1 text-xs text-[#64748B]">
                          Stock: {selectedProduct.quantity}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={`order-item-${index}-quantity`}
                        className="mb-1 block text-xs font-semibold text-[#64748B]"
                      >
                        Quantity
                      </label>

                      <input
                        id={`order-item-${index}-quantity`}
                        type="number"
                        min="1"
                        max={selectedProduct?.quantity}
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`order-item-${index}-unit-price`}
                        className="mb-1 block text-xs font-semibold text-[#64748B]"
                      >
                        Unit Price
                      </label>

                      <input
                        id={`order-item-${index}-unit-price`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, "unitPrice", e.target.value)
                        }
                        className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#64748B]">
                        Available
                      </label>

                      <div className="rounded-lg border border-[#E2E8F0] bg-slate-50 px-3 py-2 text-sm font-semibold text-[#0F172A]">
                        {selectedProduct?.quantity ?? 0}
                      </div>
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
              disabled={createOrderMutation.isPending}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                createOrderMutation.isPending ||
                productsQuery.isPending ||
                hasNoProducts
              }
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createOrderMutation.isPending ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
