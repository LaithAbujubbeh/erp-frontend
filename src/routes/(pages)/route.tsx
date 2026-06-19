import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import SidebarSkeleton from "../../components/SidebarSkeleton";

export const Route = createFileRoute("/(pages)")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <SidebarSkeleton />

        <main className="min-h-screen p-4 md:ml-72 md:p-6">
          <div className="space-y-6">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-xl bg-slate-200"
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg border p-2 text-slate-700"
        >
          <Menu size={22} />
        </button>

        <h1 className="ml-4 text-lg font-bold text-slate-900">NEXUS ERP</h1>
      </header>

      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="min-h-screen md:ml-72">
        <Outlet />
      </main>
    </div>
  );
}
