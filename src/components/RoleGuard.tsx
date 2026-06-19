import type { ReactNode } from "react";
import type { UserRole } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Checking permissions...</p>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="rounded-xl w-full border border-red-200 bg-red-50 p-6 text-red-600">
        You do not have permission to access this page.
      </div>
    );
  }

  return children;
}
