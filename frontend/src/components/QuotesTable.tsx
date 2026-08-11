import type { RecentQuoteItemDTO, RecentQuotesPaginationDTO } from "../types/dashboard";
import { StatusBadge } from "./StatusBadge";
import { Icon } from "./Icon";

interface QuotesTableProps {
  data: RecentQuoteItemDTO[];
  pagination: RecentQuotesPaginationDTO;
  /** Called when the user clicks previous/next page */
  onPageChange: (page: number) => void;
}

const ACTION_BUTTON_CLASS =
  "p-1 text-secondary hover:text-primary rounded-DEFAULT hover:bg-surface-container transition-colors";

export function QuotesTable({ data, pagination, onPageChange }: QuotesTableProps) {
  const { page, totalPages } = pagination;
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
      {/* Table Controls/Filters (Minimalist) */}
      <div className="p-sm border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
        <button
          type="button"
          className="p-1.5 text-secondary hover:text-primary rounded-DEFAULT hover:bg-surface-container transition-colors flex items-center gap-xs font-body-sm text-body-sm border border-transparent hover:border-outline-variant"
        >
          <Icon name="filter_list" size={18} />
          Filtrar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              <th className="py-3 px-md font-body-sm text-body-sm font-semibold text-on-surface">
                Data
              </th>
              <th className="py-3 px-md font-body-sm text-body-sm font-semibold text-on-surface">
                Cliente
              </th>
              <th className="py-3 px-md font-body-sm text-body-sm font-semibold text-on-surface">
                Projeto
              </th>
              <th className="py-3 px-md font-body-sm text-body-sm font-semibold text-on-surface">
                Valor Total
              </th>
              <th className="py-3 px-md font-body-sm text-body-sm font-semibold text-on-surface">
                Status
              </th>
              <th className="py-3 px-md font-body-sm text-body-sm font-semibold text-on-surface text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
            {data.map((quote) => (
              <tr key={quote.id} className="hover:bg-surface-container-low transition-colors group">
                <td className="py-3 px-md text-secondary">{quote.createdAt}</td>
                <td className="py-3 px-md font-medium">{quote.clientName}</td>
                <td className="py-3 px-md text-secondary">{quote.projectName}</td>
                <td className="py-3 px-md font-label-mono text-label-mono">
                  {quote.formattedValue}
                </td>
                <td className="py-3 px-md">
                  <StatusBadge status={quote.status} />
                </td>
                <td className="py-3 px-md text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      className={ACTION_BUTTON_CLASS}
                      title="Baixar PDF"
                      onClick={() => {
                        window.open(`/api/quotes/${quote.id}/pdf`, "_blank");
                      }}
                    >
                      <Icon name="download" size={18} />
                    </button>
                    <button type="button" className={ACTION_BUTTON_CLASS} title="Copiar Link">
                      <Icon name="link" size={18} />
                    </button>
                    <button type="button" className={ACTION_BUTTON_CLASS} title="Editar">
                      <Icon name="edit" size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Pagination */}
      <div className="px-md py-sm border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
        <span className="font-body-sm text-body-sm text-secondary">
          {pagination.summary}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1 text-secondary hover:text-primary rounded-DEFAULT hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasPrevious}
            onClick={() => onPageChange(page - 1)}
            aria-label="Página anterior"
          >
            <Icon name="chevron_left" size={18} />
          </button>
          <button
            type="button"
            className="p-1 text-secondary hover:text-primary rounded-DEFAULT hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasNext}
            onClick={() => onPageChange(page + 1)}
            aria-label="Próxima página"
          >
            <Icon name="chevron_right" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}