import { Link } from "@tanstack/react-router";
import type { UserRole } from "../../api/auth";
import { navLinks } from "../../config/navlinks";

type NavLinksProps = {
  role: UserRole;
  onNavigate?: () => void;
};

const baseLinkClass =
  "flex w-full items-center gap-3 rounded px-4 py-3 hover:bg-[#2563EB] hover:text-white";

const activeLinkClass = "bg-[#2563EB] text-white font-bold";

export default function NavLinks({ role, onNavigate }: NavLinksProps) {
  const visibleLinks = navLinks.filter((link) =>
    link.allowedRoles.includes(role),
  );

  return (
    <ul className="flex flex-col gap-2 text-sm">
      {visibleLinks.map((link) => {
        const Icon = link.icon;

        return (
          <li key={link.to} className="w-full">
            <Link
              to={link.to}
              onClick={onNavigate}
              className={baseLinkClass}
              activeProps={{
                className: activeLinkClass,
              }}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
