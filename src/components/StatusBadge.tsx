type StatusBadgeProps = {
  status: string;
};

const statusClasses: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  RECEIVED: "bg-green-100 text-green-700",
  ACTIVE: "bg-green-100 text-green-700",

  PENDING: "bg-amber-100 text-amber-700",
  DRAFT: "bg-slate-100 text-slate-700",

  CANCELLED: "bg-red-100 text-red-700",
  INACTIVE: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusClasses[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}
