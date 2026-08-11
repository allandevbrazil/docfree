# DocPrático BFF

Backend For Frontend (BFF) para o sistema **DocPrático** — gerenciador de orçamentos e clientes para profissionais autônomos e pequenas empresas (marceneiros, montadores, reformas, etc.).

O BFF expõe uma **API REST** com:

- **Dashboard** — KPIs (orçamentos aprovados, aguardando resposta, taxa de conversão) + histórico recente em um único endpoint
- **Clientes** — CRUD completo (criar, listar, buscar, atualizar, excluir) com paginação e filtros
- **Orçamentos** — CRUD completo com itens, descontos e status
- **Swagger** — Documentação interativa (OpenAPI 3.0) em `/api-docs`

---

## 🏗️ Stack Tecnológico

| Camada        | Tecnologia                          |
| ------------- | ----------------------------------- |
| Runtime       | Node.js 20 + TypeScript             |
| Framework Web | Express                             |
| Banco de Dados| PostgreSQL 16                       |
| ORM           | Prisma                              |
| Documentação  | Swagger (OpenAPI 3.0)               |
| Infraestrutura| Docker + docker-compose             |
| Deploy        | Render (Docker runtime)             |

---

## 📁 Estrutura de Pastas (Clean Architecture)

```
backend/
├── prisma/
│   ├── migrations/          # Migrações geradas pelo Prisma
│   ├── schema.prisma        # Modelagem do banco de dados
│   └── seed.ts              # Script de seed com dados falsos
├── src/
│   ├── domain/              # CAMADA DOMAIN (entidades + contratos)
│   │   ├── entities/        # Entidades de negócio (Client, Quote, QuoteItem)
│   │   └── repositories/    # Interfaces dos repositórios
│   ├── application/         # CAMADA APPLICATION (casos de uso)
│   │   ├── dtos/            # Data Transfer Objects (formato BFF)
│   │   ├── services/        # DashboardService (orquestra os use cases)
│   │   └── use-cases/       # Use cases de Dashboard, Clientes e Orçamentos
│   ├── infrastructure/      # CAMADA INFRASTRUCTURE (ORM, banco)
│   │   ├── database/        # Prisma Client singleton
│   │   └── repositories/    # Implementações concretas dos repositórios
│   ├── presentation/        # CAMADA PRESENTATION (HTTP)
│   │   ├── controllers/     # Controllers (injeção de use cases)
│   │   ├── middlewares/     # Error handler global
│   │   ├── routes/          # Rotas + anotações Swagger
│   │   └── swagger/         # Configuração do Swagger
│   ├── shared/              # Container de injeção de dependências
│   ├── app.ts               # Configuração do Express
│   └── server.ts            # Bootstrap do servidor
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── render.yaml
├── tsconfig.json
└── README.md
```

### Explicação das camadas

1. **Domain** — Contém as entidades de negócio (`Client`, `Quote`, `QuoteItem`) e as **interfaces** dos repositórios. Nenhuma dependência externa (ORM, framework) entra aqui. É o coração do sistema.

2. **Application** — Contém os **casos de uso** que orquestram as regras de negócio. Cada caso de uso recebe um repositório via **injeção de dependência** (construtor). Os **DTOs** definem exatamente o formato que o front-end espera (padrão BFF). O **DashboardService** consolida os casos de uso em um único payload para a tela.

3. **Infrastructure** — Implementa as interfaces do Domain usando Prisma. É a **única** camada que fala com o banco de dados.

4. **Presentation** — Camada HTTP: controllers, rotas, middlewares e Swagger. Os controllers são "finos" — apenas delegam para os casos de uso.

5. **Shared** — Container de injeção de dependências (composition root) que conecta todas as camadas.

---

## 🚀 Como Baixar e Instalar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior
- [Docker](https://www.docker.com/) + Docker Compose **ou** PostgreSQL local
- [Git](https://git-scm.com/)

### Clonar o repositório

```bash
git clone https://github.com/allandevbrazil/docfree.git
cd docfree/backend
```

### Opção 1: Docker Compose (recomendado — mais rápido)

```bash
# Sobe o PostgreSQL + aplicação (build automático)
docker compose up -d

# Aplicação roda em http://localhost:3333
# Swagger em http://localhost:3333/api-docs
```

> Com o Docker Compose, as migrações e o seed são executados automaticamente na inicialização do container.

### Opção 2: Desenvolvimento local

```bash
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

# 5. Rodar migrações
npm run prisma:migrate

# 6. Popular o banco com dados falsos (opcional)
npm run prisma:seed

# 7. Iniciar o servidor em modo dev
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

## 📖 Como Usar (Swagger)

Com o servidor rodando, acesse a documentação interativa:

```
http://localhost:3333/api-docs
```

A interface **Swagger UI** permite explorar e testar todos os endpoints da API:

### Passo a passo

1. **Abra o Swagger** em `http://localhost:3333/api-docs`
2. **Explore os endpoints** — a página lista os grupos **Dashboard**, **Clients** e **Quotes** com todos os endpoints disponíveis
3. **Clique em um endpoint** para expandir e ver:
   - Parâmetros (query, path, body)
   - Schemas de requisição e resposta
   - Exemplos de valores
4. **Teste uma requisição** — clique no botão **Try it out**:
   - Preencha os parâmetros desejados
   - Clique em **Execute**
   - Veja a resposta da API (status, headers e corpo) diretamente no navegador

### Exemplo prático: criar um cliente

1. Expanda o grupo **Clients** → `POST /api/clients`
2. Clique em **Try it out**
3. No corpo da requisição, preencha:

```json
{
  "name": "João da Silva",
  "email": "joao.silva@email.com",
  "phone": "(11) 98765-4321",
  "company": "Casa do João",
  "cep": "01310-100",
  "street": "Av. Paulista",
  "number": "1000",
  "neighborhood": "Bela Vista",
  "city": "São Paulo",
  "state": "SP"
}
```

4. Clique em **Execute** — a resposta `201 Created` retorna o cliente criado com `id`, `createdAt` e `updatedAt`.

---

## 📡 Endpoints

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

### `GET /api/dashboard`

Retorna **todos os dados da tela de Dashboard em uma única requisição** (padrão BFF):

| Parâmetro   | Tipo    | Descrição                          |
| ----------- | ------- | ---------------------------------- |
| `page`      | integer | Página atual (default: 1)          |
| `pageSize`  | integer | Itens por página (default: 10, máx: 50) |
| `status`    | string  | Filtro: `APPROVED`, `PENDING`, `REJECTED` |
| `clientName`| string  | Filtro por nome do cliente (parcial) |

```json
{
  "overview": {
    "approvedQuotes": {
      "totalValue": 12450,
      "formattedValue": "R$ 12.450,00",
      "percentageChange": 12,
      "isPositiveChange": true
    },
    "awaitingResponse": {
      "count": 3
    },
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

### `GET /api/clients`

Lista clientes com paginação e filtros:

| Parâmetro   | Tipo    | Descrição                          |
| ----------- | ------- | ---------------------------------- |
| `page`      | integer | Página atual (default: 1)          |
| `pageSize`  | integer | Itens por página (default: 10, máx: 100) |
| `search`    | string  | Busca por nome ou e-mail (parcial) |
| `city`      | string  | Filtro por cidade                  |
| `state`     | string  | Filtro por estado (UF)             |

### `POST /api/quotes`

Cria um novo orçamento com itens e desconto:

```json
{
  "clientId": "uuid-do-cliente",
  "projectName": "Armários Cozinha",
  "items": [
    {
      "description": "Armário planejado 2m",
      "quantity": 1,
      "unitPrice": 4500
    }
  ],
  "discount": 0,
  "discountType": "FIXED",
  "termsAndConditions": "Pagamento em até 30 dias"
}
```

---

## 🗄️ Modelagem do Banco

### Client

| Campo        | Tipo      | Descrição                     |
| ------------ | --------- | ----------------------------- |
| id           | UUID      | Chave primária                |
| name         | String    | Nome do cliente               |
| email        | String    | E-mail (único)                |
| phone        | String?   | Telefone                      |
| company      | String?   | Empresa                       |
| cep          | String?   | CEP                           |
| street       | String?   | Logradouro                    |
| number       | String?   | Número                        |
| neighborhood | String?   | Bairro                        |
| city         | String?   | Cidade                        |
| state        | String?   | Estado (UF)                   |
| notes        | String?   | Notas internas                |
| createdAt    | DateTime  | Data de criação               |
| updatedAt    | DateTime  | Data de atualização           |

### Quote (Orçamento)

| Campo              | Tipo       | Descrição                          |
| ------------------ | ---------- | ---------------------------------- |
| id                 | UUID       | Chave primária                     |
| clientId           | UUID       | FK → Client                        |
| projectName        | String     | Nome do projeto                    |
| subtotal           | Decimal    | Subtotal antes do desconto (12,2)  |
| discount           | Decimal    | Valor do desconto (12,2)           |
| discountType       | Enum       | `FIXED`, `PERCENTAGE`              |
| totalValue         | Decimal    | Valor total após desconto (12,2)   |
| status             | Enum       | `APPROVED`, `PENDING`, `REJECTED`  |
| termsAndConditions | String?    | Termos e condições                 |
| publicLink         | String?    | Link público compartilhável        |
| sentAt             | DateTime   | Data de envio do orçamento         |
| createdAt          | DateTime   | Data de criação                    |
| updatedAt          | DateTime   | Data de atualização                |

### QuoteItem (Item do Orçamento)

| Campo       | Tipo      | Descrição                     |
| ----------- | --------- | ----------------------------- |
| id          | UUID      | Chave primária                |
| quoteId     | UUID      | FK → Quote                    |
| description | String    | Descrição do item             |
| quantity    | Decimal   | Quantidade (10,2)             |
| unitPrice   | Decimal   | Preço unitário (12,2)         |
| totalPrice  | Decimal   | Preço total (12,2)            |
| createdAt   | DateTime  | Data de criação               |
| updatedAt   | DateTime  | Data de atualização           |

---

## 🧠 Decisões Técnicas

### BFF Pattern
Os endpoints retornam dados **já formatados** para o front-end:
- Valores monetários como `"R$ 12.450,00"` (via `Intl.NumberFormat` pt-BR)
- Datas como `"12/10/2023"` (DD/MM/YYYY)
- Mensagens de paginação como `"Mostrando 4 de 24 registros"`
- **Endpoint único** `GET /api/dashboard` que entrega a tela inteira em uma chamada

Isso elimina processamento de formatação no cliente e reduz o número de requisições.

### Clean Architecture
- **Domain** não importa nada de infraestrutura
- **Application** depende apenas de interfaces (repositórios)
- **Infrastructure** implementa as interfaces
- **Presentation** injeta os casos de uso via container

### SOLID
- **S**: Cada classe tem uma única responsabilidade
- **O**: Novos repositórios podem ser adicionados sem alterar use cases
- **D**: Use cases dependem de abstrações (`QuoteRepository`), não de implementações

### Consultas Otimizadas
- `Promise.all` para consultas paralelas nos KPIs
- `aggregate` com `_sum` para somar valores aprovados
- `count` com filtros de data no banco (sem trazer dados para a memória)
- Paginação com `skip`/`take` no Prisma

---

## 🔄 Scripts Úteis

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

## 🧪 Próximos Passos (Sugestões)

- [ ] Autenticação (JWT) e autorização por usuário
- [ ] Filtros avançados no histórico (período, faixa de valor)
- [ ] Exportação de PDF dos orçamentos
- [ ] Testes unitários (Jest/Vitest) com repositórios mockados
- [ ] Testes de integração (Supertest)
- [ ] CI/CD pipeline