import { Icon } from "./Icon";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
      <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-md border border-outline-variant">
        <Icon name="request_quote" size={32} className="text-secondary" />
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-secondary max-w-md mb-lg">
        {description}
      </p>
      <button
        type="button"
        onClick={onAction}
        className="bg-primary text-on-primary font-body-md text-body-md px-4 py-2 rounded-DEFAULT hover:opacity-90 transition-opacity font-medium shadow-sm flex items-center gap-xs"
      >
        <Icon name="add" size={18} />
        {actionLabel}
      </button>
    </div>
  );
}