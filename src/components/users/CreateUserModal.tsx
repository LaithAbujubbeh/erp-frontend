import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

import {
  createUser,
  type CreateUserInput,
  type UserRole,
} from "../../api/users";

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateUserModal({
  isOpen,
  onClose,
}: CreateUserModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CASHIER");
  const [formError, setFormError] = useState("");

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      handleClose();
    },
  });

  function handleClose() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("CASHIER");
    setFormError("");
    createUserMutation.reset();
    onClose();
  }

  function validateForm() {
    if (!name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!password.trim()) return "Password is required";

    if (password.length < 6) {
      return "Password must be at least 6 characters";
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

    const input: CreateUserInput = {
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    };

    createUserMutation.mutate(input);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Create User</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Add a new team member to the ERP system.
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
          {(formError || createUserMutation.isError) && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {formError ||
                createUserMutation.error?.message ||
                "Failed to create user"}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0F172A]">
              Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0F172A]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0F172A]">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0F172A]">
              Role
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            >
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="CASHIER">Cashier</option>
              <option value="INVENTORY_STAFF">Inventory Staff</option>
            </select>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={createUserMutation.isPending}
              className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
