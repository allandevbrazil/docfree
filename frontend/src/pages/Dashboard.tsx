import { useEffect, useState } from "react";
import type { DashboardDTO } from "../types/dashboard";
import { fetchDashboard } from "../services/api";
import { Header, type PageKey } from "../components/Header";
import { KpiCard } from "../components/KpiCard";
import { QuotesTable } from "../components/QuotesTable";
import { EmptyState } from "../components/EmptyState";
import { Icon } from "../components/Icon";

function TrendIndicator({
  value,
  isPositive,
  suffix = "%",
}: {
  value: number;
  isPositive: boolean;
  suffix?: string;
}) {
  return (
    <span
      className={`flex items-center ${isPositive ? "text-green-700" : "text-red-700"}`}
    >
      <Icon
        name={isPositive ? "arrow_upward" : "arrow_downward"}
        size={14}
      />
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

interface DashboardProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

export function Dashboard({ activePage, onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchDashboard({ page, pageSize });
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro inesperado ao carregar o dashboard"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const isLoading = loading && !data;

  return (
    <div className="min-h-screen bg-background">
      <Header activePage={activePage} onNavigate={onNavigate} />

      <main className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        {error && !data ? (
          // --- Initial load error state ---
          <div className="bg-error-container border border-error text-on-error-container rounded-lg p-xl text-center">
            <h2 className="font-headline-md text-headline-md mb-sm">
              Não foi possível carregar o dashboard
            </h2>
            <p className="font-body-md text-body-md mb-lg">{error}</p>
            <button
              type="button"
              onClick={() => setPage(1)}
              className="bg-primary text-on-primary font-body-md text-body-md px-4 py-2 rounded-DEFAULT hover:opacity-90 transition-opacity font-medium shadow-sm"
            >
              Tentar novamente
            </button>
          </div>
        ) : isLoading ? (
          // --- Loading state ---
          <div className="flex flex-col items-center justify-center py-32 text-secondary">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-md" />
            <p className="font-body-md text-body-md">Carregando dashboard…</p>
          </div>
        ) : data ? (
          <>
            {/* Page Heading */}
            <div className="mb-lg">
              <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
                Visão Geral
              </h1>
              <p className="font-body-md text-body-md text-secondary mt-xs">
                Acompanhe o desempenho dos seus orçamentos e conversões.
              </p>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
              <KpiCard
                label="Orçamentos Aprovados"
                icon="check_circle"
                value={data.overview.approvedQuotes.formattedValue}
                footer={
                  <>
                    <TrendIndicator
                      value={data.overview.approvedQuotes.percentageChange}
                      isPositive={data.overview.approvedQuotes.isPositiveChange}
                    />
                    em relação ao mês anterior
                  </>
                }
              />

              <KpiCard
                label="Aguardando Resposta"
                icon="hourglass_empty"
                value={String(data.overview.awaitingResponse.count)}
                footer="Orçamentos enviados nesta semana"
              />

              <KpiCard
                label="Taxa de Conversão"
                icon="trending_up"
                value={data.overview.conversionRate.formattedRate}
                footer={
                  <>
                    <TrendIndicator
                      value={data.overview.conversionRate.variation}
                      isPositive={
                        data.overview.conversionRate.isPositiveVariation
                      }
                    />
                    em relação ao mês anterior
                  </>
                }
              />
            </div>

            {/* Recent Quotes Section */}
            <div className="mb-md flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Histórico Recente
              </h2>
              <button
                type="button"
                className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors flex items-center gap-xs"
              >
                Ver todos
                <Icon name="arrow_forward" size={16} />
              </button>
            </div>

            {data.recentQuotes.data.length === 0 ? (
              <EmptyState
                title="Nenhum orçamento ainda"
                description="Você ainda não criou nenhum orçamento. Comece a enviar propostas profissionais para seus clientes agora mesmo."
                actionLabel="Criar Primeiro Orçamento"
              />
            ) : (
              <QuotesTable
                data={data.recentQuotes.data}
                pagination={data.recentQuotes.pagination}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}