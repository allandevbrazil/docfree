import { useEffect, useState, type FormEvent } from "react";
import type { Client, ClientInput } from "../types/client";
import {
  createClient,
  deleteClient,
  fetchClients,
  updateClient,
} from "../services/clients";
import { Header, type PageKey } from "../components/Header";
import { Icon } from "../components/Icon";

interface ClientsProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

type FormErrors = Partial<Record<keyof ClientInput, string>>;

const EMPTY: ClientInput = {
  name: "", email: "", phone: "", company: "", cep: "", street: "",
  number: "", neighborhood: "", city: "", state: "", notes: "",
};

const IC =
  "w-full rounded-DEFAULT border bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 transition-colors";
const IC_NORMAL = `${IC} border-outline-variant focus:border-primary focus:ring-surface-container-high`;
const IC_ERROR = `${IC} border-error focus:border-error focus:ring-error-container bg-error-container`;
const LB =
  "font-label-mono text-label-mono text-on-surface-variant uppercase mb-1 block";
const ERR = "font-body-sm text-body-sm text-error mt-1";

/* ---------- Masks ---------- */
function onlyDigits(v: string): string {
  return v.replace(/\D/g, "");
}

function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskCep(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

function maskState(value: string): string {
  return value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
}

/* ---------- Validators ---------- */
function validate(form: ClientInput): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Nome é obrigatório.";
  } else if (form.name.trim().length < 3) {
    errors.name = "Nome deve ter pelo menos 3 caracteres.";
  }

  if (!form.email.trim()) {
    errors.email = "E-mail é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Informe um e-mail válido (ex.: nome@dominio.com).";
  }

  if (form.phone && onlyDigits(form.phone).length < 10) {
    errors.phone = "Telefone deve ter DDD + número (mín. 10 dígitos).";
  }

  if (form.cep && onlyDigits(form.cep).length !== 8) {
    errors.cep = "CEP deve ter 8 dígitos.";
  }

  if (form.state && form.state.length !== 2) {
    errors.state = "Use a sigla com 2 letras (ex.: SP).";
  }

  return errors;
}

function Field({
  label, value, onChange, type = "text", required, placeholder,
  span = "", error, disabled, maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  span?: string;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
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
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className={ERR}>{error}</p>}
    </div>
  );
}

export function Clients({ activePage, onNavigate }: ClientsProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState({
    page: 1, pageSize: 10, total: 0, totalPages: 1, summary: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientInput>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);

  const formDisabled = !isNew && !selectedId;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchClients({ page, pageSize: 10, search });
      setClients(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  function setF(key: keyof ClientInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function fill(c: Client) {
    setF("name", c.name); setF("email", c.email);
    setF("phone", c.phone ?? ""); setF("company", c.company ?? "");
    setF("cep", c.cep ?? ""); setF("street", c.street ?? "");
    setF("number", c.number ?? ""); setF("neighborhood", c.neighborhood ?? "");
    setF("city", c.city ?? ""); setF("state", c.state ?? "");
    setF("notes", c.notes ?? "");
  }

  function handleRowClick(c: Client) {
    setSelectedId(c.id);
    setIsNew(false);
    setErrors({});
    setForm(EMPTY);
    fill(c);
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
        await createClient(form);
        setFeedback("Cliente criado com sucesso!");
      } else if (selectedId) {
        await updateClient(selectedId, form);
        setFeedback("Cliente atualizado com sucesso!");
      }
      resetForm();
      await load();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Erro ao salvar cliente");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!window.confirm("Excluir este cliente?")) return;
    setSaving(true);
    setFeedback(null);
    try {
      await deleteClient(selectedId);
      setFeedback("Cliente excluído!");
      resetForm();
      await load();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Erro ao excluir cliente");
    } finally {
      setSaving(false);
    }
  }

  const hasPrevious = page > 1;
  const hasNext = page < pagination.totalPages;
  const th =
    "py-3 px-md font-body-sm text-body-sm font-semibold text-on-surface";

  return (
    <div className="min-h-screen bg-background">
      <Header activePage={activePage} onNavigate={onNavigate} />

      <main className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col gap-xl">
        {/* ===== Upper Half: Master List ===== */}
        <section className="flex flex-col gap-md">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Meus Clientes
          </h1>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
            <div className="relative w-full sm:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                search
              </span>
              <input
                className={`${IC} pl-10`}
                placeholder="Buscar clientes..."
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
            <button
              type="button"
              onClick={handleNew}
              className="bg-primary text-on-primary font-body-md text-body-md px-4 py-2 rounded-DEFAULT hover:opacity-90 transition-opacity font-medium shadow-sm flex items-center gap-xs"
            >
              <Icon name="add" size={18} />
              Novo Cliente
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
                      <th className={th}>Nome do Cliente</th>
                      <th className={th}>Telefone/WhatsApp</th>
                      <th className={th}>Cidade/UF</th>
                      <th className={th}>Empresa</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                    {loading && clients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-secondary">
                          Carregando clientes…
                        </td>
                      </tr>
                    ) : clients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-secondary">
                          Nenhum cliente encontrado.
                        </td>
                      </tr>
                    ) : (
                      clients.map((client) => (
                        <tr
                          key={client.id}
                          onClick={() => handleRowClick(client)}
                          className={`cursor-pointer transition-colors ${
                            selectedId === client.id
                              ? "bg-surface-container-high"
                              : "hover:bg-surface-container-low"
                          }`}
                        >
                          <td className="py-3 px-md font-medium">{client.name}</td>
                          <td className="py-3 px-md text-secondary">{client.phone ?? "—"}</td>
                          <td className="py-3 px-md text-secondary">
                            {client.city ? `${client.city}/${client.state ?? ""}` : "—"}
                          </td>
                          <td className="py-3 px-md text-secondary">{client.company ?? "—"}</td>
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
              Editor de Cliente
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {formDisabled
                ? "Selecione um cliente na tabela ou clique em Novo Cliente para editar."
                : isNew
                  ? "Preencha os dados do novo cliente. Campos com * são obrigatórios."
                  : "Preencha ou atualize os dados do cliente selecionado."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {/* Card: Dados do Cliente */}
              <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm shadow-sm">
                <h3 className="font-body-md text-body-md font-semibold text-primary mb-2">
                  Dados do Cliente
                </h3>
                <Field
                  label="Nome Completo" value={form.name} required
                  disabled={formDisabled} error={errors.name}
                  onChange={(v) => setF("name", v)}
                />
                <Field
                  label="E-mail" type="email" value={form.email} required
                  disabled={formDisabled} error={errors.email}
                  onChange={(v) => setF("email", v)}
                />
                <Field
                  label="Telefone (WhatsApp)" value={form.phone ?? ""} placeholder="(11) 98765-4321"
                  disabled={formDisabled} error={errors.phone}
                  onChange={(v) => setF("phone", maskPhone(v))}
                />
                <Field
                  label="Empresa" value={form.company ?? ""}
                  disabled={formDisabled}
                  onChange={(v) => setF("company", v)}
                />
              </div>

              {/* Card: Endereço */}
              <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm shadow-sm">
                <h3 className="font-body-md text-body-md font-semibold text-primary mb-2">
                  Endereço
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
                  <Field
                    label="CEP" value={form.cep ?? ""} placeholder="18010-000"
                    disabled={formDisabled} error={errors.cep}
                    onChange={(v) => setF("cep", maskCep(v))}
                  />
                  <Field
                    label="Rua" value={form.street ?? ""} span="sm:col-span-2"
                    disabled={formDisabled}
                    onChange={(v) => setF("street", v)}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
                  <Field
                    label="Número" value={form.number ?? ""}
                    disabled={formDisabled}
                    onChange={(v) => setF("number", v)}
                  />
                  <Field
                    label="Bairro" value={form.neighborhood ?? ""} span="sm:col-span-2"
                    disabled={formDisabled}
                    onChange={(v) => setF("neighborhood", v)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-sm">
                  <Field
                    label="Cidade" value={form.city ?? ""}
                    disabled={formDisabled}
                    onChange={(v) => setF("city", v)}
                  />
                  <Field
                    label="Estado" value={form.state ?? ""} placeholder="SP"
                    maxLength={2} disabled={formDisabled} error={errors.state}
                    onChange={(v) => setF("state", maskState(v))}
                    span=""
                  />
                </div>
              </div>

              {/* Card: Observações */}
              <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col gap-sm shadow-sm">
                <h3 className="font-body-md text-body-md font-semibold text-primary mb-2">
                  Observações
                </h3>
                <div className="flex-1 flex flex-col">
                  <label className={LB}>Notas internas sobre este cliente</label>
                  <textarea
                    className={`${IC_NORMAL} flex-1 min-h-[120px] resize-none`}
                    placeholder="Adicione notas aqui..."
                    disabled={formDisabled}
                    value={form.notes ?? ""}
                    onChange={(e) => setF("notes", e.target.value)}
                  />
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
                  {saving ? "Salvando…" : "Salvar Cliente"}
                </span>
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}