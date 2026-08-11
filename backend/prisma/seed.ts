import { PrismaClient, QuoteStatus, DiscountType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed script for DocPrático Dashboard
 *
 * Generates realistic data matching the dashboard design exactly:
 * - KPI 1: Approved quotes total R$ 12.450,00 with 12% growth vs previous month
 * - KPI 2: 3 pending quotes sent in the current week
 * - KPI 3: 68% conversion rate with +4% variation vs previous month
 *
 * Uses fixed day-of-month dates so KPIs are stable regardless of when the
 * seed is executed.
 */

interface SeedClient {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  notes?: string;
}

interface SeedQuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface SeedQuote {
  clientIndex: number;
  projectName: string;
  subtotal: number;
  discount: number;
  discountType: DiscountType;
  totalValue: number;
  status: QuoteStatus;
  sentAt: Date;
  termsAndConditions?: string;
  items: SeedQuoteItem[];
}

// ---------------------------------------------------------------------------
// Date Helpers (fixed day-of-month so KPIs are deterministic)
// ---------------------------------------------------------------------------

/**
 * Returns a date on the given day of the current month.
 * If the requested day is in the future (relative to "now"),
 * it is clamped to today so the quote is never excluded by
 * date-range filters (sentAt <= now).
 */
function dayOfCurrentMonth(day: number, hour = 10): Date {
  const now = new Date();
  const today = now.getDate();

  // Clamp future days to today (keeps KPIs deterministic)
  if (day > today) {
    const clamped = new Date(now);
    clamped.setHours(Math.min(hour, 23), 0, 0, 0);
    return clamped;
  }

  const date = new Date();
  date.setDate(day);
  date.setHours(hour, 0, 0, 0);
  return date;
}

/** Returns a date on the given day of the previous month. */
function dayOfPreviousMonth(day: number, hour = 10): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(day);
  date.setHours(hour, 0, 0, 0);
  return date;
}

/** Returns the start (Monday 00:00) of the current week. */
function startOfCurrentWeek(): Date {
  const date = new Date();
  const day = date.getDay(); // 0 = Sunday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Returns a date on the given offset (0 = Monday) of the current week,
 * clamped so it never exceeds "now" (avoids future dates).
 */
function dayInCurrentWeek(offsetFromMonday: number, hour = 10): Date {
  const start = startOfCurrentWeek();
  const candidate = new Date(start);
  candidate.setDate(start.getDate() + offsetFromMonday);
  candidate.setHours(hour, 0, 0, 0);

  const now = new Date();
  if (candidate > now) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0, 0);
  }
  return candidate;
}

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

const clients: SeedClient[] = [
  {
    name: "João da Silva",
    email: "joao.silva@email.com",
    phone: "(11) 98765-4321",
    company: "Residência",
    cep: "01310-100",
    street: "Av. Paulista",
    number: "1000",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    notes: "Cliente prefere contato por WhatsApp.",
  },
  {
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    phone: "(11) 91234-5678",
    company: "Escritório MO",
    cep: "04538-133",
    street: "Av. Brigadeiro Faria Lima",
    number: "3477",
    neighborhood: "Itaim Bibi",
    city: "São Paulo",
    state: "SP",
    notes: "Projeto em andamento — escritório de advocacia.",
  },
  {
    name: "Carlos Souza",
    email: "carlos.souza@email.com",
    phone: "(21) 99876-5432",
    company: "CS Interiores",
    cep: "22071-000",
    street: "Av. Atlântica",
    number: "1500",
    neighborhood: "Copacabana",
    city: "Rio de Janeiro",
    state: "RJ",
  },
  {
    name: "Empresa XYZ",
    email: "contato@empresaxyz.com.br",
    phone: "(11) 3456-7890",
    company: "Empresa XYZ Ltda",
    cep: "04794-000",
    street: "Av. das Nações Unidas",
    number: "12901",
    neighborhood: "Brooklin",
    city: "São Paulo",
    state: "SP",
    notes: "Contrato corporativo — faturamento mensal.",
  },
  {
    name: "Ana Beatriz Costa",
    email: "ana.costa@email.com",
    phone: "(31) 98765-1234",
    company: "ABC Arquitetura",
    cep: "30130-010",
    street: "Rua da Bahia",
    number: "1148",
    neighborhood: "Centro",
    city: "Belo Horizonte",
    state: "MG",
  },
  {
    name: "Pedro Henrique Lima",
    email: "pedro.lima@email.com",
    phone: "(41) 99887-6655",
    company: "PHL Design",
    cep: "80420-090",
    street: "Rua Comendador Araújo",
    number: "499",
    neighborhood: "Batel",
    city: "Curitiba",
    state: "PR",
  },
  {
    name: "Fernanda Almeida",
    email: "fernanda.almeida@email.com",
    phone: "(51) 91234-0987",
    company: "FA Decor",
    cep: "90450-001",
    street: "Av. Carlos Gomes",
    number: "700",
    neighborhood: "Boa Vista",
    city: "Porto Alegre",
    state: "RS",
  },
  {
    name: "Ricardo Santos",
    email: "ricardo.santos@email.com",
    phone: "(11) 97654-3210",
    company: "RS Engenharia",
    cep: "05422-020",
    street: "Rua dos Pinheiros",
    number: "870",
    neighborhood: "Pinheiros",
    city: "São Paulo",
    state: "SP",
  },
  {
    name: "Juliana Pereira",
    email: "juliana.pereira@email.com",
    phone: "(19) 99876-1122",
    company: "JP Interiores",
    cep: "13025-000",
    street: "Av. Francisco Glicério",
    number: "1200",
    neighborhood: "Centro",
    city: "Campinas",
    state: "SP",
  },
  {
    name: "Construtora Horizonte",
    email: "projetos@horizonte.com.br",
    phone: "(11) 4002-8922",
    company: "Construtora Horizonte",
    cep: "04543-000",
    street: "Av. Engenheiro Luís Carlos Berrini",
    number: "105",
    neighborhood: "Cidade Monções",
    city: "São Paulo",
    state: "SP",
    notes: "Grande volume — priorizar atendimento.",
  },
  {
    name: "Lucas Martins",
    email: "lucas.martins@email.com",
    phone: "(11) 98765-7788",
    company: "LM Marcenaria",
    cep: "03101-000",
    street: "Rua da Mooca",
    number: "2500",
    neighborhood: "Mooca",
    city: "São Paulo",
    state: "SP",
  },
  {
    name: "Beatriz Rocha",
    email: "beatriz.rocha@email.com",
    phone: "(21) 99876-3344",
    company: "BR Arquitetura",
    cep: "22440-000",
    street: "Rua Jardim Botânico",
    number: "500",
    neighborhood: "Jardim Botânico",
    city: "Rio de Janeiro",
    state: "RJ",
  },
];

// Helper to build a quote with a single item
function singleItemQuote(
  clientIndex: number,
  projectName: string,
  itemDescription: string,
  unitPrice: number,
  quantity: number,
  status: QuoteStatus,
  sentAt: Date,
  discount = 0,
  discountType: DiscountType = DiscountType.FIXED
): SeedQuote {
  const subtotal = unitPrice * quantity;
  const totalValue = subtotal - discount;
  return {
    clientIndex,
    projectName,
    subtotal,
    discount,
    discountType,
    totalValue,
    status,
    sentAt,
    items: [
      {
        description: itemDescription,
        quantity,
        unitPrice,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Current Month — APPROVED (17 quotes, total = R$ 12.450,00)
// Conversion: 17 approved / 25 total = 68%
// ---------------------------------------------------------------------------
const currentMonthApprovedQuotes: SeedQuote[] = [
  singleItemQuote(0, "Armários Cozinha", "Armário planejado 2m com puxadores", 2300, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(2)),
  singleItemQuote(4, "Closet Master", "Closet master 3m com espelhos", 1500, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(3)),
  singleItemQuote(5, "Home Office", "Mesa + estante home office", 1200, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(4)),
  singleItemQuote(6, "Estante Sala", "Estante sala 2,5m", 950, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(5)),
  singleItemQuote(2, "Painel TV", "Painel TV 2,2m", 800, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(6)),
  singleItemQuote(1, "Mesa Jantar", "Mesa jantar 1,8m", 750, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(7)),
  singleItemQuote(10, "Rack Sala", "Rack sala 2m", 700, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(8)),
  singleItemQuote(1, "Cadeiras Reunião", "4x cadeiras reunião", 162.5, 4, QuoteStatus.APPROVED, dayOfCurrentMonth(9)),
  singleItemQuote(3, "Bancada Cozinha", "Bancada cozinha 2m", 600, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(10)),
  singleItemQuote(7, "Prateleiras", "Prateleiras flutuantes 3x", 550, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(11)),
  singleItemQuote(8, "Nicho Banheiro", "Nicho banheiro com iluminação", 500, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(12)),
  singleItemQuote(9, "Porta de Correr", "Porta de correr 2m", 450, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(13)),
  singleItemQuote(11, "Sapateira", "Sapateira 1,2m", 400, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(14)),
  singleItemQuote(0, "Gaveteiro", "Gaveteiro 0,8m", 350, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(15)),
  singleItemQuote(4, "Painel Ripado", "Painel ripado 3m", 300, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(16)),
  singleItemQuote(5, "Espelho Decorativo", "Espelho decorativo 1m", 250, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(17)),
  singleItemQuote(6, "Puxadores", "Kit puxadores 10x", 200, 1, QuoteStatus.APPROVED, dayOfCurrentMonth(18)),
];

// ---------------------------------------------------------------------------
// Current Month — PENDING (5 quotes, 3 sent in the current week)
// ---------------------------------------------------------------------------
const currentMonthPendingQuotes: SeedQuote[] = [
  singleItemQuote(1, "Mesa Escritório", "Mesa escritório 1,6m", 1200, 1, QuoteStatus.PENDING, dayInCurrentWeek(0)),
  singleItemQuote(2, "Painel TV", "Painel TV 2,2m", 2800, 1, QuoteStatus.PENDING, dayInCurrentWeek(1)),
  singleItemQuote(10, "Cama Box + Headboard", "Cama box + headboard casal", 3400, 1, QuoteStatus.PENDING, dayInCurrentWeek(2)),
  // These two are sent earlier in the month (outside the current week),
  // so only the 3 quotes above count for the "Aguardando Resposta" KPI.
  singleItemQuote(4, "Cozinha Gourmet", "Cozinha gourmet completa", 6800, 1, QuoteStatus.PENDING, dayOfCurrentMonth(8)),
  singleItemQuote(6, "Lavabo", "Lavabo com cuba", 2200, 1, QuoteStatus.PENDING, dayOfCurrentMonth(5)),
];

// ---------------------------------------------------------------------------
// Current Month — REJECTED (3 quotes)
// ---------------------------------------------------------------------------
const currentMonthRejectedQuotes: SeedQuote[] = [
  singleItemQuote(11, "Projeto Sala de Estar", "Projeto sala de estar completo", 1800, 1, QuoteStatus.REJECTED, dayOfCurrentMonth(6)),
  singleItemQuote(0, "Banheiro Suite", "Banheiro suíte com nichos", 2600, 1, QuoteStatus.REJECTED, dayOfCurrentMonth(10)),
  singleItemQuote(3, "Divisórias Escritório", "Divisórias escritório 12m²", 4200, 1, QuoteStatus.REJECTED, dayOfCurrentMonth(14)),
];

// ---------------------------------------------------------------------------
// Previous Month — APPROVED (14 quotes, total = R$ 11.116,07)
// Growth: (12450 - 11116.07) / 11116.07 = 12%
// Conversion: 14 approved / 22 total = 63.6% ≈ 64%
// ---------------------------------------------------------------------------
const previousMonthApprovedQuotes: SeedQuote[] = [
  singleItemQuote(7, "Cozinha Planejada", "Cozinha planejada completa", 1500, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(2)),
  singleItemQuote(8, "Guarda-Roupa Casal", "Guarda-roupa casal 2,8m", 1200, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(4)),
  singleItemQuote(9, "Reforma Sala Comercial", "Reforma sala comercial 40m²", 1000, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(6)),
  singleItemQuote(3, "Recepção Empresa", "Recepção empresa 20m²", 900, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(8)),
  singleItemQuote(7, "Escritório Home", "Escritório home completo", 850, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(10)),
  singleItemQuote(1, "Mesa Reunião", "Mesa reunião 2,4m", 800, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(12)),
  singleItemQuote(3, "Divisórias", "Divisórias escritório 10m²", 750, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(14)),
  singleItemQuote(11, "Painel Quarto", "Painel quarto 2,4m", 700, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(16)),
  singleItemQuote(5, "Estante Escritório", "Estante escritório 2m", 650, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(18)),
  singleItemQuote(8, "Bancada Banheiro", "Bancada banheiro 1,2m", 600, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(20)),
  singleItemQuote(9, "Armário Lavanderia", "Armário lavanderia 1,5m", 550, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(22)),
  singleItemQuote(10, "Prateleiras", "Prateleiras 2x", 500, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(24)),
  singleItemQuote(0, "Cabideiro", "Cabideiro 1m", 450, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(26)),
  singleItemQuote(2, "Acessórios", "Kit acessórios diversos", 666.07, 1, QuoteStatus.APPROVED, dayOfPreviousMonth(28)),
];

// ---------------------------------------------------------------------------
// Previous Month — PENDING (4 quotes)
// ---------------------------------------------------------------------------
const previousMonthPendingQuotes: SeedQuote[] = [
  singleItemQuote(11, "Painel Quarto", "Painel quarto 2,4m", 2100, 1, QuoteStatus.PENDING, dayOfPreviousMonth(3)),
  singleItemQuote(8, "Cozinha Americana", "Cozinha americana 3m", 4600, 1, QuoteStatus.PENDING, dayOfPreviousMonth(5)),
  singleItemQuote(1, "Estante Livros", "Estante livros 2m", 1100, 1, QuoteStatus.PENDING, dayOfPreviousMonth(7)),
  singleItemQuote(2, "Home Theater", "Painel home theater 3m", 3200, 1, QuoteStatus.PENDING, dayOfPreviousMonth(9)),
];

// ---------------------------------------------------------------------------
// Previous Month — REJECTED (4 quotes)
// ---------------------------------------------------------------------------
const previousMonthRejectedQuotes: SeedQuote[] = [
  singleItemQuote(10, "Rack Sala", "Rack sala 2m", 1300, 1, QuoteStatus.REJECTED, dayOfPreviousMonth(11)),
  singleItemQuote(2, "Painel Home Theater", "Painel home theater 3m", 3200, 1, QuoteStatus.REJECTED, dayOfPreviousMonth(13)),
  singleItemQuote(0, "Quarto Infantil", "Quarto infantil completo", 2400, 1, QuoteStatus.REJECTED, dayOfPreviousMonth(15)),
  singleItemQuote(4, "Banheiro Suite", "Banheiro suíte com nichos", 2600, 1, QuoteStatus.REJECTED, dayOfPreviousMonth(17)),
];

// ---------------------------------------------------------------------------
// Main Seed Execution
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("🌱 Starting DocPrático seed...");

  // Clean existing data (respecting FK order)
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.client.deleteMany();

  console.log("🧹 Cleared existing data");

  // Create clients
  const createdClients = [];
  for (const client of clients) {
    const created = await prisma.client.create({
      data: client,
    });
    createdClients.push(created);
  }
  console.log(`✅ Created ${createdClients.length} clients`);

  // Combine all quotes
  const allQuotes: SeedQuote[] = [
    ...currentMonthApprovedQuotes,
    ...currentMonthPendingQuotes,
    ...currentMonthRejectedQuotes,
    ...previousMonthApprovedQuotes,
    ...previousMonthPendingQuotes,
    ...previousMonthRejectedQuotes,
  ];

  // Create quotes with nested items
  for (const quote of allQuotes) {
    const client = createdClients[quote.clientIndex];
    await prisma.quote.create({
      data: {
        clientId: client.id,
        projectName: quote.projectName,
        subtotal: quote.subtotal,
        discount: quote.discount,
        discountType: quote.discountType,
        totalValue: quote.totalValue,
        status: quote.status,
        sentAt: quote.sentAt,
        createdAt: quote.sentAt,
        termsAndConditions:
          "Condições de pagamento: 50% de entrada e 50% na entrega. " +
          "Validade do orçamento: 30 dias. " +
          "Garantia de 12 meses sobre mão de obra e materiais.",
        publicLink: `https://docpratico.app/orcamento/${quote.projectName
          .toLowerCase()
          .replace(/\s+/g, "-")}-${quote.sentAt.getTime()}`,
        items: {
          create: quote.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
    });
  }

  console.log(`✅ Created ${allQuotes.length} quotes with items`);
  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });