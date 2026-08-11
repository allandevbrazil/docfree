# DocPrático

Sistema **DocPrático** — gerenciador de orçamentos e clientes para profissionais autônomos e pequenas empresas (marceneiros, montadores, reformas, etc.).

O projeto é um **monorepo** composto por:

| Pasta      | Descrição                                                                 |
| ---------- | ------------------------------------------------------------------------- |
| `backend/` | **BFF (Backend For Frontend)** — API REST em Node.js/TypeScript com Express, Prisma e PostgreSQL. Documentação interativa via Swagger. |
| `frontend/`| Aplicação frontend (em desenvolvimento — placeholder).                   |

---

## 🏗️ Arquitetura

### Visão Geral

```
┌──────────────────────────┐        ┌──────────────────────────────────────────┐
│       Frontend           │  HTTP  │                  Backend (BFF)           │
│   (em desenvolvimento)   │ ─────► │  /api/dashboard   →  DashboardService     │
│                          │        │  /api/clients     →  Client Use Cases     │
│                          │        │  /api/quotes      →  Quote Use Cases      │
│                          │        │  /api-docs        →  Swagger UI           │
└──────────────────────────┘        └──────────────┬───────────────────────────┘
                                                   │ Prisma (ORM)
                                                   ▼
                                        ┌──────────────────────┐
                                        │     PostgreSQL       │
                                        │  (clients, quotes,   │
                                        │   quote_items)       │
                                        └──────────────────────┘
```

O backend segue o padrão **BFF (Backend For Frontend)**: os endpoints retornam dados **já formatados** para a interface (valores monetários em `R$`, datas em `DD/MM/YYYY`, mensagens de paginação prontas), eliminando processamento de formatação no cliente e reduzindo o número de requisições.

### Arquitetura Interna do Backend (Clean Architecture)

```
backend/src/
├── domain/              # CAMADA DOMAIN — entidades + contratos (sem deps externas)
│   ├── entities/        #   Client, Quote, QuoteItem
│   └── repositories/    #   Interfaces dos repositórios
├── application/         # CAMADA APPLICATION — casos de uso + DTOs (padrão BFF)
│   ├── dtos/            #   Formato exato que o frontend espera
│   ├── services/        #   DashboardService (consolida use cases)
│   └── use-cases/       #   GetDashboardMetrics, GetRecentQuotes, CRUD Client/Quote
├── infrastructure/      # CAMADA INFRASTRUCTURE — implementações (Prisma)
│   ├── database/        #   Prisma Client singleton
│   └── repositories/    #   Implementações concretas dos repositórios
├── presentation/        # CAMADA PRESENTATION — HTTP
│   ├── controllers/     #   Controllers finos (delegam para use cases)
│   ├── middlewares/     #   Error handler global
│   ├── routes/          #   Rotas + anotações Swagger
│   └── swagger/         #   Configuração do Swagger (OpenAPI 3.0)
├── shared/              # Container de injeção de dependência (composition root)
├── app.ts               # Configuração do Express
└── server.ts            # Bootstrap do servidor
```

**Princípios aplicados:**

- **Clean Architecture** — `domain` não importa infraestrutura; `application` depende apenas de interfaces; `infrastructure` implementa as interfaces; `presentation` injeta os casos de uso.
- **SOLID** — cada classe com responsabilidade única; use cases dependem de abstrações (`QuoteRepository`), não de implementações concretas.
- **Injeção de Dependência** — um container (`shared/container.ts`) conecta todas as camadas no composition root.

### Banco de Dados

| Modelo      | Descrição                                         |
| ----------- | ------------------------------------------------- |
| `Client`    | Cliente (nome, e-mail, telefone, endereço, notas) |
| `Quote`     | Orçamento (projeto, subtotal, desconto, status, itens) |
| `QuoteItem` | Item do orçamento (descrição, quantidade, preços) |

---

## 🛠️ Stack Tecnológico

| Camada        | Tecnologia                              |
| ------------- | --------------------------------------- |
| Runtime       | Node.js 20 + TypeScript                 |
| Framework Web | Express                                |
| Banco de Dados| PostgreSQL 16                           |
| ORM           | Prisma                                  |
| Documentação  | Swagger (OpenAPI 3.0)                  |
| Infraestrutura| Docker + docker-compose                |
| Deploy        | Render (Docker runtime)                |

---

## 📥 Como Baixar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior
- [Docker](https://www.docker.com/) + Docker Compose **ou** PostgreSQL local
- [Git](https://git-scm.com/)

### Clonar o repositório

```bash
git clone https://github.com/allandevbrazil/docfree.git
cd docfree
```

---

## 🚀 Como Instalar

### Opção 1: Docker Compose (recomendado — mais rápido)

```bash
cd backend

# Sobe o PostgreSQL + aplicação (build automático)
docker compose up -d

# A aplicação roda em http://localhost:3333
# O Swagger fica em http://localhost:3333/api-docs
```

> Com o Docker Compose, as migrações e o seed são executados automaticamente na inicialização do container.

### Opção 2: Desenvolvimento local

```bash
cd backend

# 1. Instalar dependências
npm install

# 2. Subir apenas o PostgreSQL (ou usar um PostgreSQL local)
docker compose up -d postgres

# 3. Configurar variáveis de ambiente
cp .env.example .env
```

Edite o `.env` criado com os valores do seu ambiente (veja a seção [Configuração](#-como-configurar)).

```bash
# 4. Gerar o Prisma Client
npm run prisma:generate

# 5. Rodar as migrações do banco
npm run prisma:migrate

# 6. (Opcional) Popular o banco com dados falsos
npm run prisma:seed

# 7. Iniciar o servidor em modo desenvolvimento
npm run dev
```

> ⚠️ O `RUN_SEED=true` deve ser usado **somente** em ambiente local/dev. Em produção, mantenha `RUN_SEED=false` para não sobrescrever dados reais.

---

## ⚙️ Como Configurar

As variáveis de ambiente são definidas no arquivo `.env` (criado a partir de `.env.example`):

| Variável       | Descrição                                            | Exemplo                                                              |
| -------------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| `NODE_ENV`     | Ambiente de execução                                 | `development`                                                        |
| `PORT`         | Porta do servidor HTTP                               | `3333`                                                               |
| `API_PREFIX`   | Prefixo base da API                                  | `/api`                                                               |
| `RUN_SEED`     | Executa o seed de dados falsos (`true`/`false`)      | `false`                                                              |
| `DATABASE_URL` | Connection string do PostgreSQL (usada pelo Prisma)  | `postgresql://docpratico:docpratico@localhost:5432/docpratico?schema=public` |

> 🔒 **Segurança:** Nunca commite o arquivo `.env` nem valores reais de secrets. O `.gitignore` já protege `.env`, `.env.*`, `*.pem` e `*.key`. Para produção (ex.: Render), defina as variáveis no painel do provedor — nunca no código-fonte.

---

## 📖 Como Usar

### Documentação Interativa (Swagger)

Com o servidor rodando, acesse:

```
http://localhost:3333/api-docs
```

A interface **Swagger UI** permite:

- Explorar todos os endpoints da API (Dashboard, Clients, Quotes)
- Visualizar schemas, parâmetros e exemplos de resposta
- **Executar requisições** diretamente pelo navegador (botão **Try it out**)

### Endpoints Disponíveis

| Método | Rota                  | Descrição                                              |
| ------ | --------------------- | ------------------------------------------------------ |
| GET    | `/health`             | Health check da aplicação                              |
| GET    | `/api-docs`           | Swagger UI (documentação interativa)                   |
| GET    | `/api/dashboard`      | Dados completos do Dashboard (KPIs + histórico recente) |
| GET    | `/api/clients`        | Lista clientes (paginação + filtros)                   |
| POST   | `/api/clients`        | Cria um novo cliente                                   |
| GET    | `/api/clients/{id}`   | Busca cliente por ID                                   |
| PUT    | `/api/clients/{id}`   | Atualiza cliente                                       |
| DELETE | `/api/clients/{id}`   | Remove cliente                                         |
| GET    | `/api/quotes`         | Lista orçamentos (paginação + filtros)                 |
| POST   | `/api/quotes`         | Cria um novo orçamento (com itens e desconto)          |
| GET    | `/api/quotes/{id}`    | Busca orçamento por ID                                 |
| PUT    | `/api/quotes/{id}`    | Atualiza orçamento                                     |
| DELETE | `/api/quotes/{id}`    | Remove orçamento                                       |

### Exemplo: Dashboard

```bash
# KPIs + últimos orçamentos (com filtros e paginação)
curl "http://localhost:3333/api/dashboard?page=1&pageSize=10&status=APPROVED"
```

Resposta (padrão BFF — dados já formatados):

```json
{
  "overview": {
    "approvedQuotes": {
      "totalValue": 12450,
      "formattedValue": "R$ 12.450,00",
      "percentageChange": 12,
      "isPositiveChange": true
    },
    "awaitingResponse": { "count": 3 },
    "conversionRate": {
      "rate": 68,
      "formattedRate": "68%",
      "variation": 4,
      "isPositiveVariation": true
    }
  },
  "recentQuotes": {
    "data": [
      {
        "id": "uuid",
        "createdAt": "12/10/2023",
        "clientName": "João da Silva",
        "projectName": "Armários Cozinha",
        "totalValue": 4500,
        "formattedValue": "R$ 4.500,00",
        "status": "APPROVED"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 24,
      "totalPages": 3,
      "summary": "Mostrando 4 de 24 registros"
    }
  }
}
```

> 📚 A documentação detalhada do backend (modelagem do banco, decisões técnicas, próximos passos) está em [`backend/README.md`](backend/README.md).

---

## 🔄 Scripts Úteis (backend)

| Comando                  | Descrição                                   |
| ------------------------ | ------------------------------------------- |
| `npm run dev`            | Inicia o servidor em modo watch (tsx)       |
| `npm run build`          | Compila o TypeScript para `dist/`           |
| `npm start`              | Executa a build de produção                 |
| `npm run prisma:generate`| Gera o Prisma Client                        |
| `npm run prisma:migrate` | Aplica migrações em dev                     |
| `npm run prisma:deploy`  | Aplica migrações em produção                |
| `npm run prisma:seed`    | Popula o banco com dados falsos             |
| `npm run prisma:studio`  | Abre o Prisma Studio (UI do banco)          |
| `npm run docker:up`      | Sobe PostgreSQL + app via Docker Compose    |
| `npm run docker:down`    | Derruba os containers                       |

---

## 🔐 Segurança

Este projeto segue uma política rigorosa de segurança:

- **Secrets nunca em arquivos versionados** — API keys, tokens e connection strings ficam apenas em variáveis de ambiente ou no painel do provedor.
- **`.gitignore` protege** — `.env`, `.env.*`, `*.pem`, `*.key` e pastas de build (`node_modules`, `dist`) são ignorados.
- **Referencie, não cole** — configurações de CI/CD e deploy usam variáveis (`${VARIAVEL}`), nunca valores literais.

---

## 🧪 Status do Projeto

- [x] Backend BFF (Dashboard, Clientes, Orçamentos)
- [x] Swagger (OpenAPI 3.0)
- [x] Docker + docker-compose
- [x] Deploy configurado para Render (Docker runtime)
- [ ] Frontend (em desenvolvimento)
- [ ] Autenticação (JWT)
- [ ] Testes unitários e de integração
- [ ] CI/CD pipeline