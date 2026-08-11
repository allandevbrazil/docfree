import { useEffect, useState, type FormEvent } from "react";
import type { Quote, QuoteInput, QuoteItemInput, QuoteStatus } from "../types/quote";
import {
  createQuote,
  deleteQuote,
  fetchQuotes,
  updateQuote,
} from "../services/quotes";
import type { Client } from "../types/client";
import { fetchClients } from "../services/clients";
import { Header, type PageKey } from "../components/Header";
import { Icon } from "../components/Icon";
import { StatusBadge } from "../components/StatusBadge";

interface QuotesProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

type FormErrors = Partial<Record<string, string>>;

const EMPTY_ITEM: QuoteItemInput = {
  description: "",
  quantity: 1,
  unitPrice: 0,
};

const EMPTY: QuoteInput = {
  clientId: "",
  projectName: "",
  items: [{ ...EMPTY_ITEM }],
  discount: 0,
  discountType: "FIXED",
  termsAndConditions: "",
  status: "PENDING",
};

const IC =
  "w-full rounded-DEFAULT border bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 transition-colors";
const IC_NORMAL = `${IC} border-outline-variant focus:border-primary focus:ring-surface-container-high`;
const IC_ERROR = `${IC} border-error focus:border-error focus:ring-error-container bg-error-container`;
const LB =
  "font-label-mono text-label-mono text-on-surface-variant uppercase mb-1 block";
const ERR = "font-body-sm text-body-sm text-error mt-1";

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "PENDING", label: "Pendente" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "REJECTED", label: "Rejeitado" },
];

/* ---------- Helpers ---------- */
function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function calcSubtotal(items: QuoteItemInput[]): number {
  return items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
}

function calcTotal(
  subtotal: number,
  discount: number,
  discountType: "FIXED" | "PERCENTAGE"
): number {
  if (discountType === "PERCENTAGE") {
    return subtotal - (subtotal * (discount || 0)) / 100;
  }
  return subtotal - (discount || 0);
}

/* ---------- Validators ---------- */
function validate(form: QuoteInput): FormErrors {
  const errors: FormErrors = {};

  if (!form.clientId) {
    errors.clientId = "Selecione um cliente.";
  }

  if (!form.projectName.trim()) {
    errors.projectName = "Nome do projeto é obrigatório.";
  } else if (form.projectName.trim().length < 3) {
    errors.projectName = "Nome do projeto deve ter pelo menos 3 caracteres.";
  }

  if (!form.items || form.items.length === 0) {
    errors.items = "Adicione pelo menos um item.";
  } else {
    form.items.forEach((item, index) => {
      if (!item.description.trim()) {
        errors[`items.${index}.description`] = "Descrição obrigatória.";
      }
      if (item.quantity <= 0) {
        errors[`items.${index}.quantity`] = "Quantidade deve ser maior que 0.";
      }
      if (item.unitPrice < 0) {
        errors[`items.${index}.unitPrice`] = "Preço não pode ser negativo.";
      }
    });
  }

  if ((form.discount ?? 0) < 0) {
    errors.discount = "Desconto não pode ser negativo.";
  }
  if (
    form.discountType === "PERCENTAGE" &&
    (form.discount ?? 0) > 100
  ) {
    errors.discount = "Percentual de desconto não pode passar de 100%.";
  }

  return errors;
}

function Field({
  label, value, onChange, type = "text", required, placeholder,
  span = "", error, disabled, maxLength, min, step,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  span?: string;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  min?: number;
  step?: number;
}) {
  return (
    <div className={span}>
      <label className={LB}>{label}{required ? " *" : ""}</label>
      <input
        type={type}
        className={error ? IC_ERROR : IC_NORMAL}
        value={value}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className={ERR}>{error}</p>}
    </div>
  );
}

export function Quotes({ activePage, onNavigate }: QuotesProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pagination, setPagination] = useState({
    page: 1, pageSize: 10, total: 0, totalPages: 1, summary: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "">("");
  const [page, setPage] = useState(1);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<QuoteInput>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const formDisabled = !isNew && !selectedId;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchQuotes({
        page,
        pageSize: 10,
        clientName: search,
        projectName: search,
        status: statusFilter || undefined,
      });
      setQuotes(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    setClientsLoading(true);
    try {
      const result = await fetchClients({ page: 1, pageSize: 100 });
      setClients(result.data);
    } catch {
      // Non-blocking: the editor will show an error if no clients are available
    } finally {
      setClientsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  useEffect(() => {
    void loadClients();
  }, []);

  function setF(key: keyof QuoteInput, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function setItem(index: number, key: keyof QuoteItemInput, value: string | number) {
    setForm((prev) => {
      const items = prev.items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      );
      return { ...prev, items };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`items.${index}.${key}`];
      return next;
    });
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...EMPTY_ITEM }],
    }));
  }

  function removeItem(index: number) {
    setForm((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: items.length > 0 ? items : [{ ...EMPTY_ITEM }] };
    });
  }

  function fill(q: Quote) {
    setF("clientId", q.clientId);
    setF("projectName", q.projectName);
    setF("discount", q.discount);
    setF("discountType", q.discountType);
    setF("termsAndConditions", q.termsAndConditions ?? "");
    setF("status", q.status);
    setForm((prev) => ({
      ...prev,
      items: q.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }));
  }

  function handleRowClick(q: Quote) {
    setSelectedId(q.id);
    setIsNew(false);
    setErrors({});
    setForm(EMPTY);
    fill(q);
  }

  function handleNew() {
    setSelectedId(null);
    setIsNew(true);
    setForm(EMPTY);
    setErrors({});
  }

  function resetForm() {
    setSelectedId(null);
    setIsNew(false);
    setForm(EMPTY);
    setErrors({});
    setFeedback(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (formDisabled) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFeedback("Corrija os campos destacados antes de salvar.");
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      if (isNew) {
        await createQuote(form);
        setFeedback("Orçamento criado com sucesso!");
      } else if (selectedId) {
        await updateQuote(selectedId, form);
        setFeedback("Orçamento atualizado com sucesso!");
      }
      resetForm();
      await load();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Erro ao salvar orçamento");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!window.confirm("Excluir este orçamento?")) return;
    setSaving(true);
    setFeedback(null);
    try {
      await deleteQuote(selectedId);
      setFeedback("Orçamento excluído!");
      resetForm();
      await load();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Erro ao excluir orçamento");
    } finally {
      setSaving(false);
    }
  }

  const hasPrevious = page > 1;
  const hasNext = page < pagination.totalPages;
  const th =
    "py-3 px-md font-body-sm text-body-sm font-semibold text-on-surface";

  const subtotal = calcSubtotal(form.items);
  const total = calcTotal(subtotal, form.discount ?? 0, form.discountType ?? "FIXED");

  return (
    <div className="min-h-screen bg-background">
      <Header activePage={activePage} onNavigate={onNavigate} />

      <main className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col gap-xl">
        {/* ===== Upper Half: Master List ===== */}
        <section className="flex flex-col gap-md">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Meus Orçamentos
          </h1>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
            <div className="flex flex-col sm:flex-row gap-sm w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  search
                </span>
                <input
                  className={`${IC} pl-10`}
                  placeholder="Buscar por cliente ou projeto..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearch(searchInput.trim());
                      setPage(1);
                    }
                  }}
                />
              </div>
              <select
                className={`${IC} w-full sm:w-44`}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as QuoteStatus | "");
                  setPage(1);
                }}
              >
                <option value="">Todos os status</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleNew}
              className="bg-primary text-on-primary font-body-md text-body-md px-4 py-2 rounded-DEFAULT hover:opacity-90 transition-opacity font-medium shadow-sm flex items-center gap-xs"
            >
              <Icon name="add" size={18} />
              Novo Orçamento
            </button>
          </div>

          {error ? (
            <div className="bg-error-container border border-error text-on-error-container rounded-lg p-md text-center">
              {error}
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className={th}>Data</th>
                      <th className={th}>Cliente</th>
                      <th className={th}>Projeto</th>
                      <th className={th}>Valor Total</th>
                      <th className={th}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                    {loading && quotes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-secondary">
                          Carregando orçamentos…
                        </td>
                      </tr>
                    ) : quotes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-secondary">
                          Nenhum orçamento encontrado.
                        </td>
                      </tr>
                    ) : (
                      quotes.map((quote) => (
                        <tr
                          key={quote.id}
                          onClick={() => handleRowClick(quote)}
                          className={`cursor-pointer transition-colors ${
                            selectedId === quote.id
                              ? "bg-surface-container-high"
                              : "hover:bg-surface-container-low"
                          }`}
                        >
                          <td className="py-3 px-md text-secondary">
                            {formatDate(quote.createdAt)}
                          </td>
                          <td className="py-3 px-md font-medium">{quote.clientName}</td>
                          <td className="py-3 px-md text-secondary">{quote.projectName}</td>
                          <td className="py-3 px-md font-label-mono text-label-mono">
                            {formatBRL(quote.totalValue)}
                          </td>
                          <td className="py-3 px-md">
                            <StatusBadge status={quote.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-md py-sm border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-secondary">
                  {pagination.summary}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="p-1 text-secondary hover:text-primary rounded-DEFAULT hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!hasPrevious}
                    onClick={() => setPage(page - 1)}
                    aria-label="Página anterior"
                  >
                    <Icon name="chevron_left" size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-secondary hover:text-primary rounded-DEFAULT hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!hasNext}
                    onClick={() => setPage(page + 1)}
                    aria-label="Próxima página"
                  >
                    <Icon name="chevron_right" size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="border-t border-dashed border-outline-variant w-full" />

        {/* ===== Lower Half: Editor ===== */}
        <section className="flex flex-col gap-lg pb-xl">
          <div>
            <h2 className="font-headline-md text-headline-md font-semibold text-primary">
              Editor de Orçamento
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {formDisabled
                ? "Selecione um orçamento na tabela ou clique em Novo Orçamento para editar."
                : isNew
                  ? "Preencha os dados do novo orçamento. Campos com * são obrigatórios."
                  : "Preencha ou atualize os dados do orçamento selecionado."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {/* Card: Dados do Orçamento */}
              <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm shadow-sm">
                <h3 className="font-body-md text-body-md font-semibold text-primary mb-2">
                  Dados do Orçamento
                </h3>
                <div>
                  <label className={LB}>Cliente *</label>
                  <select
                    className={errors.clientId ? IC_ERROR : IC_NORMAL}
                    value={form.clientId}
                    disabled={formDisabled}
                    onChange={(e) => setF("clientId", e.target.value)}
                  >
                    <option value="">{clientsLoading ? "Carregando clientes…" : "Selecione um cliente…"}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && <p className={ERR}>{errors.clientId}</p>}
                </div>
                <Field
                  label="Nome do Projeto" value={form.projectName} required
                  disabled={formDisabled} error={errors.projectName}
                  placeholder="Ex.: Armários Cozinha"
                  onChange={(v) => setF("projectName", v)}
                />
                <div>
                  <label className={LB}>Status</label>
                  <select
                    className={IC_NORMAL}
                    value={form.status}
                    disabled={formDisabled}
                    onChange={(e) => setF("status", e.target.value as QuoteStatus)}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Card: Itens do Orçamento */}
              <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-body-md text-body-md font-semibold text-primary">
                    Itens do Orçamento
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={formDisabled}
                    className="text-primary hover:opacity-80 transition-opacity font-body-sm text-body-sm flex items-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="add" size={16} />
                    Adicionar Item
                  </button>
                </div>

                {errors.items && <p className={ERR}>{errors.items}</p>}

                <div className="flex flex-col gap-sm">
                  {form.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-sm items-start border border-outline-variant rounded-lg p-sm bg-surface-container-lowest"
                    >
                      <div className="col-span-12 sm:col-span-5">
                        <label className={LB}>Descrição *</label>
                        <input
                          className={errors[`items.${index}.description`] ? IC_ERROR : IC_NORMAL}
                          placeholder="Ex.: Armário planejado 2m"
                          disabled={formDisabled}
                          value={item.description}
                          onChange={(e) => setItem(index, "description", e.target.value)}
                        />
                        {errors[`items.${index}.description`] && (
                          <p className={ERR}>{errors[`items.${index}.description`]}</p>
                        )}
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label className={LB}>Qtd *</label>
                        <input
                          type="number"
                          min={1}
                          className={errors[`items.${index}.quantity`] ? IC_ERROR : IC_NORMAL}
                          disabled={formDisabled}
                          value={item.quantity}
                          onChange={(e) => setItem(index, "quantity", Number(e.target.value))}
                        />
                        {errors[`items.${index}.quantity`] && (
                          <p className={ERR}>{errors[`items.${index}.quantity`]}</p>
                        )}
                      </div>
                      <div className="col-span-4 sm:col-span-3">
                        <label className={LB}>Preço Unit. *</label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          className={errors[`items.${index}.unitPrice`] ? IC_ERROR : IC_NORMAL}
                          disabled={formDisabled}
                          value={item.unitPrice}
                          onChange={(e) => setItem(index, "unitPrice", Number(e.target.value))}
                        />
                        {errors[`items.${index}.unitPrice`] && (
                          <p className={ERR}>{errors[`items.${index}.unitPrice`]}</p>
                        )}
                      </div>
                      <div className="col-span-3 sm:col-span-1 flex items-end justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={formDisabled || form.items.length <= 1}
                          className="p-1.5 text-error hover:bg-error-container rounded-DEFAULT transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Remover item"
                        >
                          <Icon name="delete" size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card: Desconto e Termos */}
              <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm shadow-sm">
                <h3 className="font-body-md text-body-md font-semibold text-primary mb-2">
                  Desconto e Termos
                </h3>
                <div className="grid grid-cols-2 gap-sm">
                  <div>
                    <label className={LB}>Tipo de Desconto</label>
                    <select
                      className={IC_NORMAL}
                      value={form.discountType}
                      disabled={formDisabled}
                      onChange={(e) => setF("discountType", e.target.value as "FIXED" | "PERCENTAGE")}
                    >
                      <option value="FIXED">Valor Fixo (R$)</option>
                      <option value="PERCENTAGE">Percentual (%)</option>
                    </select>
                  </div>
                  <Field
                    label={form.discountType === "PERCENTAGE" ? "Desconto (%)" : "Desconto (R$)"}
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.discount ?? 0}
                    disabled={formDisabled}
                    error={errors.discount}
                    onChange={(v) => setF("discount", Number(v))}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className={LB}>Termos e Condições</label>
                  <textarea
                    className={`${IC_NORMAL} flex-1 min-h-[100px] resize-none`}
                    placeholder="Ex.: Pagamento em 2x sem juros. Validade de 30 dias."
                    disabled={formDisabled}
                    value={form.termsAndConditions ?? ""}
                    onChange={(e) => setF("termsAndConditions", e.target.value)}
                  />
                </div>
              </div>

              {/* Card: Resumo Financeiro */}
              <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm shadow-sm">
                <h3 className="font-body-md text-body-md font-semibold text-primary mb-2">
                  Resumo Financeiro
                </h3>
                <div className="flex flex-col gap-xs font-body-md text-body-md">
                  <div className="flex justify-between">
                    <span className="text-secondary">Subtotal</span>
                    <span className="font-label-mono text-label-mono">{formatBRL(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Desconto</span>
                    <span className="font-label-mono text-label-mono">
                      {form.discountType === "PERCENTAGE"
                        ? `-${formatBRL((subtotal * (form.discount ?? 0)) / 100)} (${form.discount ?? 0}%)`
                        : `-${formatBRL(form.discount ?? 0)}`}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-outline-variant my-1" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-on-surface">Total</span>
                    <span className="font-label-mono text-label-mono text-lg text-primary font-semibold">
                      {formatBRL(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {feedback && (
              <div
                className={`rounded-lg px-md py-sm font-body-sm text-body-sm ${
                  Object.keys(errors).length > 0 && !feedback.includes("sucesso") && !feedback.includes("excluído")
                    ? "bg-error-container border border-error text-on-error-container"
                    : "bg-surface-container-high border border-outline-variant text-on-surface"
                }`}
              >
                {feedback}
              </div>
            )}

            <div className="flex justify-end items-center gap-md pt-4">
              {selectedId && !isNew && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-error hover:opacity-80 transition-opacity font-body-md text-body-md flex items-center gap-xs"
                >
                  <Icon name="delete" size={18} />
                  Excluir
                </button>
              )}
              <button
                type="button"
                onClick={resetForm}
                className="text-secondary hover:text-on-surface transition-colors font-body-md text-body-md px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || formDisabled}
                className="bg-primary text-on-primary font-body-md text-body-md px-4 py-2 rounded-DEFAULT hover:opacity-90 transition-opacity font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-xs">
                  <Icon name="save" size={18} />
                  {saving ? "Salvando…" : "Salvar Orçamento"}
                </span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}