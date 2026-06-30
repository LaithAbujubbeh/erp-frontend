import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import * as z from "zod";

import {
  createCustomer,
  updateCustomer,
  type CreateCustomerInput,
  type Customer,
} from "../../api/customers";
import { useAuth } from "../../hooks/useAuth";

type CustomerFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
};

type CustomerFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "ACTIVE" | "INACTIVE";
};

const defaultValues: CustomerFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  status: "ACTIVE",
};

const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z
    .string()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Invalid email address",
    }),
  phone: z.string().max(10),
  address: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

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

function getFormValues(customer?: Customer | null): CustomerFormValues {
  if (!customer) return defaultValues;

  return {
    name: customer.name,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    status: customer.status ?? "ACTIVE",
  };
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  customer,
}: CustomerFormModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isEditMode = Boolean(customer);

  const canManageStatus = user?.role === "ADMIN" || user?.role === "MANAGER";

  const saveCustomerMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string;
      input: CreateCustomerInput;
    }) => {
      if (id) {
        return updateCustomer(id, input);
      }

      return createCustomer(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const form = useForm({
    defaultValues,
    validators: {
      onChange: customerSchema,
    },
    onSubmit: ({ value }) => {
      const input: CreateCustomerInput = {
        name: value.name,
        email: value.email || undefined,
        phone: value.phone || undefined,
        address: value.address || undefined,

        // Create customers as ACTIVE by default.
        // Only ADMIN/MANAGER can control status manually.
        status: canManageStatus ? value.status : "ACTIVE",
      };

      saveCustomerMutation.mutate(
        {
          id: customer?.id,
          input,
        },
        {
          onSuccess: () => {
            form.reset();
            onClose();
          },
        },
      );
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    const values = getFormValues(customer);

    form.setFieldValue("name", values.name);
    form.setFieldValue("email", values.email);
    form.setFieldValue("phone", values.phone);
    form.setFieldValue("address", values.address);
    form.setFieldValue("status", values.status);
  }, [isOpen, customer, form]);

  function handleClose() {
    form.reset();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              {isEditMode ? "Edit Customer" : "Add Customer"}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {isEditMode
                ? "Update this customer details."
                : "Create a new customer record."}
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
          {saveCustomerMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {saveCustomerMutation.error.message}
            </div>
          )}

          <form.Field name="name">
            {(field) => (
              <div>
                <label
                  htmlFor="customer-name"
                  className="mb-1 block text-sm font-semibold text-[#0F172A]"
                >
                  Customer Name
                </label>

                <input
                  id="customer-name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ahmad Ali"
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

          <div className="grid gap-4 md:grid-cols-2">
            <form.Field name="email">
              {(field) => (
                <div>
                  <label
                    htmlFor="customer-email"
                    className="mb-1 block text-sm font-semibold text-[#0F172A]"
                  >
                    Email
                  </label>

                  <input
                    id="customer-email"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="customer@example.com"
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

            <form.Field name="phone">
              {(field) => (
                <div>
                  <label
                    htmlFor="customer-phone"
                    className="mb-1 block text-sm font-semibold text-[#0F172A]"
                  >
                    Phone
                  </label>

                  <input
                    id="customer-phone"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const onlyDigits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      field.handleChange(onlyDigits);
                    }}
                    placeholder="0790000000"
                    className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="address">
            {(field) => (
              <div>
                <label
                  htmlFor="customer-address"
                  className="mb-1 block text-sm font-semibold text-[#0F172A]"
                >
                  Address
                </label>

                <input
                  id="customer-address"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Amman, Jordan"
                  className="w-full resize-none rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
            )}
          </form.Field>

          {canManageStatus && (
            <form.Field name="status">
              {(field) => (
                <div>
                  <label
                    htmlFor="customer-status"
                    className="mb-1 block text-sm font-semibold text-[#0F172A]"
                  >
                    Status
                  </label>

                  <select
                    id="customer-status"
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

          <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={saveCustomerMutation.isPending}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saveCustomerMutation.isPending}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveCustomerMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Customer"
                  : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
