import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import * as z from "zod";

import {
  createCategory,
  updateCategory,
  type Category,
  type CreateCategoryInput,
} from "../../api/categories";

type CategoryFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
};

type CategoryFormValues = {
  name: string;
  description: string;
};

const defaultValues: CategoryFormValues = {
  name: "",
  description: "",
};

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string(),
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

function getFormValues(category?: Category | null): CategoryFormValues {
  if (!category) return defaultValues;

  return {
    name: category.name,
    description: category.description ?? "",
  };
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: CategoryFormModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(category);

  const saveCategoryMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string;
      input: CreateCategoryInput;
    }) => {
      if (id) {
        return updateCategory(id, input);
      }

      return createCategory(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const form = useForm({
    defaultValues,
    validators: {
      onChange: categorySchema,
    },
    onSubmit: ({ value }) => {
      saveCategoryMutation.mutate(
        {
          id: category?.id,
          input: {
            name: value.name,
            description: value.description || undefined,
          },
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

    const values = getFormValues(category);

    form.setFieldValue("name", values.name);
    form.setFieldValue("description", values.description);
  }, [isOpen, category, form]);

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
              {isEditMode ? "Edit Category" : "Add Category"}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {isEditMode
                ? "Update this category details."
                : "Create a new product category."}
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
          {saveCategoryMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {saveCategoryMutation.error.message}
            </div>
          )}

          <form.Field name="name">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0F172A]">
                  Category Name
                </label>

                <input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Tech Accessories"
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

          <form.Field name="description">
            {(field) => (
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#0F172A]">
                  Description
                </label>

                <textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Products related to tech accessories"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
            )}
          </form.Field>

          <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={saveCategoryMutation.isPending}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saveCategoryMutation.isPending}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveCategoryMutation.isPending
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Category"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
