import type { QuoteStatus } from "../types/dashboard";

const STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; className: string }
> = {
  APPROVED: {
    label: "Aprovado",
    className: "bg-green-50 text-green-800 border-green-200",
  },
  PENDING: {
    label: "Pendente",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  REJECTED: {
    label: "Rejeitado",
    className: "bg-red-50 text-red-800 border-red-200",
  },
};

interface StatusBadgeProps {
  status: QuoteStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-DEFAULT font-label-mono text-label-mono uppercase border ${config.className}`}
    >
      {config.label}
    </span>
  );
}