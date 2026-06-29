import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Users } from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  deactivateUser,
  getUsers,
  updateUserRole,
  updateUserStatus,
  type AppUser,
  type UserRole,
  type UserStatus,
} from "../../api/users";
import { useAuth } from "../../hooks/useAuth";
import DeleteConfirmModal from "../DeleteConfirmModal";
import StatusBadge from "../StatusBadge";
import CreateUserModal from "./CreateUserModal";
import UsersSkeleton from "./UsersSkeleton";

type UsersContentProps = {
  page: number;
  search: string;
  role: string;
  status: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (e: FormEvent<HTMLFormElement>) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
};

function formatDate(date?: string | null) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RoleBadge({ role }: { role: string }) {
  const roleClasses: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    MANAGER: "bg-blue-100 text-blue-700",
    CASHIER: "bg-amber-100 text-amber-700",
    INVENTORY_STAFF: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        roleClasses[role] || "bg-slate-100 text-slate-700"
      }`}
    >
      {role.replace("_", " ")}
    </span>
  );
}

export default function UsersContent({
  page,
  search,
  role,
  status,
  searchInput,
  onSearchInputChange,
  onSearch,
  onRoleChange,
  onStatusChange,
  onClearFilters,
  onPageChange,
}: UsersContentProps) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<AppUser | null>(
    null,
  );

  const usersQuery = useQuery({
    queryKey: ["users", { page, search, role, status }],
    queryFn: () =>
      getUsers({
        page,
        limit: 10,
        search,
        role,
        status,
      }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, nextRole }: { id: string; nextRole: UserRole }) =>
      updateUserRole(id, nextRole),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: UserStatus }) =>
      updateUserStatus(id, nextStatus),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setUserToDeactivate(null);
    },
  });

  const users = usersQuery.data?.users ?? [];
  const pagination = usersQuery.data?.pagination;

  const hasFilters = Boolean(search || role || status);

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Users</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage team members, roles, and account status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create User
        </button>
      </div>

      {(updateRoleMutation.isError || updateStatusMutation.isError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {updateRoleMutation.error?.message ||
            updateStatusMutation.error?.message}
        </div>
      )}

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
                placeholder="Search name or email..."
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
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="CASHIER">Cashier</option>
              <option value="INVENTORY_STAFF">Inventory Staff</option>
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
                Clear
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

            {role && (
              <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700">
                Role: {role}
              </span>
            )}

            {status && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                Status: {status}
              </span>
            )}
          </div>
        )}
      </div>

      {usersQuery.isPending ? (
        <UsersSkeleton />
      ) : usersQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {usersQuery.error.message}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs uppercase text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#64748B]">
                        <Users size={32} />
                        <p>No users found.</p>

                        {hasFilters && (
                          <button
                            type="button"
                            onClick={onClearFilters}
                            className="mt-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((appUser) => {
                    const isCurrentUser = appUser.id === currentUser?.id;
                    const isInactive = appUser.status === "INACTIVE";

                    return (
                      <tr
                        key={appUser.id}
                        className="border-t border-[#E2E8F0]"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#0F172A]">
                            {appUser.name}
                            {isCurrentUser && (
                              <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                You
                              </span>
                            )}
                          </p>

                          <p className="mt-1 text-xs text-[#64748B]">
                            {appUser.email}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <RoleBadge role={appUser.role} />
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={appUser.status} />
                        </td>

                        <td className="px-4 py-3 text-[#64748B]">
                          {formatDate(appUser.createdAt)}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <select
                              value={appUser.role}
                              disabled={
                                isCurrentUser || updateRoleMutation.isPending
                              }
                              onChange={(e) =>
                                updateRoleMutation.mutate({
                                  id: appUser.id,
                                  nextRole: e.target.value as UserRole,
                                })
                              }
                              className="rounded-lg border border-[#E2E8F0] px-2 py-1.5 text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="ADMIN">Admin</option>
                              <option value="MANAGER">Manager</option>
                              <option value="CASHIER">Cashier</option>
                              <option value="INVENTORY_STAFF">
                                Inventory Staff
                              </option>
                            </select>

                            <select
                              value={appUser.status}
                              disabled={
                                isCurrentUser || updateStatusMutation.isPending
                              }
                              onChange={(e) =>
                                updateStatusMutation.mutate({
                                  id: appUser.id,
                                  nextStatus: e.target.value as UserStatus,
                                })
                              }
                              className="rounded-lg border border-[#E2E8F0] px-2 py-1.5 text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="INACTIVE">Inactive</option>
                            </select>

                            {!isInactive && !isCurrentUser && (
                              <button
                                type="button"
                                onClick={() => setUserToDeactivate(appUser)}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Deactivate
                              </button>
                            )}

                            {isCurrentUser && (
                              <span className="px-3 py-1.5 text-xs text-[#64748B]">
                                Protected
                              </span>
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
              Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1} ·{" "}
              {pagination?.total ?? 0} users
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
                disabled={!pagination || page >= pagination.totalPages}
                onClick={() => onPageChange(page + 1)}
                className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <DeleteConfirmModal
        isOpen={!!userToDeactivate}
        title="Deactivate User"
        description={`Deactivate "${
          userToDeactivate?.name ?? "this user"
        }"? They will no longer be able to use the system.`}
        isDeleting={deactivateUserMutation.isPending}
        error={
          deactivateUserMutation.isError
            ? deactivateUserMutation.error.message
            : undefined
        }
        confirmText="Deactivate User"
        loadingText="Deactivating..."
        variant="danger"
        onClose={() => {
          setUserToDeactivate(null);
          deactivateUserMutation.reset();
        }}
        onConfirm={() => {
          if (!userToDeactivate) return;
          deactivateUserMutation.mutate(userToDeactivate.id);
        }}
      />
    </div>
  );
}
