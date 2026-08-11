import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

/**
 * Swagger / OpenAPI Configuration
 *
 * Generates the OpenAPI specification from JSDoc annotations
 * in the route files.
 *
 * Uses absolute paths (path.resolve) and includes BOTH source (.ts)
 * and compiled (.js) glob patterns. This guarantees the route files
 * are found regardless of the runtime environment:
 *   - Development (tsx watch): src/**\/*.ts
 *   - Production (node dist):  dist/**\/*.js
 */
const routeFiles = [
  path.resolve(process.cwd(), "src/**/*.ts"),
  path.resolve(process.cwd(), "dist/**/*.js"),
];

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DocPrático BFF API",
      version: "1.0.0",
      description:
        "Backend For Frontend for the DocPrático budget and client management system.",
    },
    servers: [
      {
        url: "/api",
        description: "API base path",
      },
    ],
    tags: [
      {
        name: "Dashboard",
        description: "Endpoints for the Dashboard screen",
      },
      {
        name: "Clients",
        description: "Endpoints for managing clients",
      },
      {
        name: "Quotes",
        description: "Endpoints for managing quotes (orçamentos)",
      },
    ],
    components: {
      schemas: {
        Client: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Client unique identifier",
            },
            name: {
              type: "string",
              description: "Client full name",
              example: "João da Silva",
            },
            email: {
              type: "string",
              format: "email",
              description: "Client email address",
              example: "joao.silva@email.com",
            },
            phone: {
              type: "string",
              nullable: true,
              description: "Client phone number",
              example: "(11) 98765-4321",
            },
            company: {
              type: "string",
              nullable: true,
              description: "Client company name",
              example: "Casa do João",
            },
            cep: {
              type: "string",
              nullable: true,
              description: "Client postal code",
              example: "01310-100",
            },
            street: {
              type: "string",
              nullable: true,
              description: "Client street address",
              example: "Av. Paulista",
            },
            number: {
              type: "string",
              nullable: true,
              description: "Client address number",
              example: "1000",
            },
            neighborhood: {
              type: "string",
              nullable: true,
              description: "Client neighborhood",
              example: "Bela Vista",
            },
            city: {
              type: "string",
              nullable: true,
              description: "Client city",
              example: "São Paulo",
            },
            state: {
              type: "string",
              nullable: true,
              description: "Client state (UF)",
              example: "SP",
            },
            notes: {
              type: "string",
              nullable: true,
              description: "Additional notes about the client",
              example: "Cliente prefere contato por WhatsApp",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        Quote: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Quote unique identifier",
            },
            clientId: {
              type: "string",
              format: "uuid",
              description: "Client unique identifier",
            },
            clientName: {
              type: "string",
              description: "Client name (denormalized for BFF)",
              example: "João da Silva",
            },
            projectName: {
              type: "string",
              description: "Project name",
              example: "Armários Cozinha",
            },
            subtotal: {
              type: "number",
              description: "Subtotal before discount",
              example: 4500,
            },
            discount: {
              type: "number",
              description: "Discount value",
              example: 0,
            },
            discountType: {
              type: "string",
              enum: ["FIXED", "PERCENTAGE"],
              description: "Discount type",
            },
            totalValue: {
              type: "number",
              description: "Total value after discount",
              example: 4500,
            },
            status: {
              type: "string",
              enum: ["APPROVED", "PENDING", "REJECTED"],
              description: "Quote status",
            },
            termsAndConditions: {
              type: "string",
              nullable: true,
              description: "Terms and conditions text",
            },
            publicLink: {
              type: "string",
              nullable: true,
              description: "Public shareable link",
            },
            sentAt: {
              type: "string",
              format: "date-time",
              description: "When the quote was sent to the client",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
            items: {
              type: "array",
              description: "Quote line items",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                  },
                  description: {
                    type: "string",
                    example: "Armário planejado 2m",
                  },
                  quantity: {
                    type: "number",
                    example: 1,
                  },
                  unitPrice: {
                    type: "number",
                    example: 4500,
                  },
                  totalPrice: {
                    type: "number",
                    example: 4500,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: routeFiles,
};

export const swaggerSpec = swaggerJsdoc(options);