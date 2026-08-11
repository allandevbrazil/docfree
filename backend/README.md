# DocPrático BFF

Backend For Frontend (BFF) para o sistema **DocPrático** — gerenciador de orçamentos e clientes.

Esta primeira entrega contempla exclusivamente a **Tela de Dashboard** com:
- KPIs (Orçamentos Aprovados, Aguardando Resposta, Taxa de Conversão)
- Histórico Recente de orçamentos (paginação + filtros)

---

## 🏗️ Stack Tecnológico

| Camada        | Tecnologia                          |
| ------------- | ----------------------------------- |
| Runtime       | Node.js + TypeScript                |
| Framework Web | Express                             |
| Banco de Dados| PostgreSQL                          |
| ORM           | Prisma                              |
| Documentação  | Swagger (OpenAPI 3.0)               |
| Infraestrutura| Docker + docker-compose             |

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
│   │   ├── entities/        # Entidades de negócio (Client, Quote)
│   │   └── repositories/    # Interfaces dos repositórios
│   ├── application/         # CAMADA APPLICATION (casos de uso)
│   │   ├── dtos/            # Data Transfer Objects (formato BFF)
│   │   ├── services/        # DashboardService (orquestra os use cases)
│   │   └── use-cases/       # GetDashboardMetricsUseCase, GetRecentQuotesUseCase
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
├── tsconfig.json
└── README.md
```

### Explicação das camadas

1. **Domain** — Contém as entidades de negócio (`Client`, `Quote`) e as **interfaces** dos repositórios. Nenhuma dependência externa (ORM, framework) entra aqui. É o coração do sistema.

2. **Application** — Contém os **casos de uso** que orquestram as regras de negócio. Cada caso de uso recebe um repositório via **injeção de dependência** (construtor). Os **DTOs** definem exatamente o formato que o front-end espera (padrão BFF). O **DashboardService** consolida os casos de uso em um único payload para a tela.

3. **Infrastructure** — Implementa as interfaces do Domain usando Prisma. É a **única** camada que fala com o banco de dados.

4. **Presentation** — Camada HTTP: controllers, rotas, middlewares e Swagger. Os controllers são "finos" — apenas delegam para os casos de uso.

5. **Shared** — Container de injeção de dependências (composition root) que conecta todas as camadas.

---

## 🚀 Como Executar

### Opção 1: Docker Compose (recomendado)

```bash
# Sobe o PostgreSQL + aplicação
docker-compose up -d

# Aplicação roda em http://localhost:3333
# Swagger em http://localhost:3333/api-docs
```

### Opção 2: Desenvolvimento local

```bash
# 1. Instalar dependências
npm install

# 2. Subir apenas o PostgreSQL
docker-compose up -d postgres

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Gerar o Prisma Client
npm run prisma:generate

# 5. Rodar migrações
npm run prisma:migrate

# 6. Popular o banco com dados falsos
npm run prisma:seed

# 7. Iniciar o servidor em modo dev
npm run dev
```

---

## 📡 Endpoints

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

### `GET /health`

Health check da aplicação.

### `GET /api-docs`

Interface Swagger (OpenAPI 3.0) com a documentação interativa.

---

## 🗄️ Modelagem do Banco

### Client

| Campo      | Tipo      | Descrição            |
| ---------- | --------- | -------------------- |
| id         | UUID      | Chave primária       |
| name       | String    | Nome do cliente      |
| email      | String    | E-mail (único)       |
| phone      | String    | Telefone             |
| createdAt  | DateTime  | Data de criação      |
| updatedAt  | DateTime  | Data de atualização  |

### Quote (Orçamento)

| Campo        | Tipo       | Descrição                          |
| ------------ | ---------- | ---------------------------------- |
| id           | UUID       | Chave primária                     |
| clientId     | UUID       | FK → Client                        |
| projectName  | String     | Nome do projeto                    |
| totalValue   | Decimal    | Valor total (precisão 12,2)        |
| status       | Enum       | `APPROVED`, `PENDING`, `REJECTED`  |
| sentAt       | DateTime   | Data de envio do orçamento         |
| createdAt    | DateTime   | Data de criação                    |
| updatedAt    | DateTime   | Data de atualização                |

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

## 🧪 Próximos Passos (Sugestões)

- [ ] Autenticação (JWT) e autorização por usuário
- [ ] CRUD completo de Clientes e Orçamentos
- [ ] Filtros avançados no histórico (período, faixa de valor)
- [ ] Exportação de PDF dos orçamentos
- [ ] Testes unitários (Jest/Vitest) com repositórios mockados
- [ ] Testes de integração (Supertest)
- [ ] CI/CD pipeline