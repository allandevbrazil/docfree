import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface KpiCardProps {
  label: string;
  icon: string;
  value: string;
  footer: ReactNode;
  /** Extra Tailwind classes for the footer content (e.g. trend color) */
  footerClassName?: string;
}

export function KpiCard({
  label,
  icon,
  value,
  footer,
  footerClassName,
}: KpiCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm flex flex-col justify-between hover:border-primary-fixed-dim transition-colors">
      <div className="flex items-center justify-between mb-sm">
        <span className="font-body-sm text-body-sm text-secondary font-medium">
          {label}
        </span>
        <Icon name={icon} size={20} className="text-secondary" />
      </div>
      <div className="font-display text-display text-on-surface">{value}</div>
      <div
        className={`font-body-sm text-body-sm text-secondary mt-xs flex items-center gap-xs ${footerClassName ?? ""}`}
      >
        {footer}
      </div>
    </div>
  );
}