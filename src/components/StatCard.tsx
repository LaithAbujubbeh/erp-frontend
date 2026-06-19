import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
};

export default function StatCard({
  title,
  value,
  helper,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#64748B]">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-[#0F172A]">{value}</h3>
          {helper && <p className="mt-1 text-xs text-[#64748B]">{helper}</p>}
        </div>

        <div className="rounded-lg bg-[#EFF6FF] p-3 text-[#2563EB]">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
