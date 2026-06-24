import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, LogOut, X } from "lucide-react";

import NavLinks from "./NavLinks";
import type { User } from "../../api/auth";
import { logoutUser } from "../../api/auth";

type SidebarProps = {
  user: User;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
      navigate({ to: "/login" });
    },
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-[#2E3039] p-3 text-[#C3C6D7] transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded bg-[#2563EB]">
            <Building2 width={28} height={28} color="white" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white">NEXUS ERP</h1>
            <p className="text-sm">Management Suite</p>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-[#C3C6D7] hover:bg-white/10 md:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* User info */}
        <div className="mb-6 rounded bg-[#252730] p-3">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-[#C3C6D7]">{user.role}</p>
        </div>

        {/* Links */}
        <nav className="flex w-full flex-1 flex-col gap-1 ">
          <NavLinks role={user.role} onNavigate={onClose} />
        </nav>

        {/* Logout */}
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="mt-auto flex w-full gap-3 rounded px-4 py-3 hover:bg-red-600 hover:text-white disabled:opacity-60"
        >
          <LogOut />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </button>
      </aside>
    </>
  );
}
