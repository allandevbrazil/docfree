import {
  Prisma,
  QuoteStatus as PrismaQuoteStatus,
  DiscountType as PrismaDiscountType,
} from "@prisma/client";
import { prisma } from "../database/prisma-client";
import {
  QuoteRepository,
  FindRecentQuotesParams,
  FindRecentQuotesResult,
  CreateQuoteData,
  UpdateQuoteData,
  QuoteWithClient,
} from "../../domain/repositories/quote-repository";
import { QuoteStatus, DiscountType } from "../../domain/entities/quote";

/**
 * Prisma Quote Repository
 *
 * Implements the QuoteRepository interface using Prisma ORM.
 * This is the only layer that talks directly to the database.
 */
export class PrismaQuoteRepository implements QuoteRepository {
  async findRecent(
    params: FindRecentQuotesParams
  ): Promise<FindRecentQuotesResult> {
    const { page, pageSize, status, search, clientName, projectName } = params;

    const where: Prisma.QuoteWhereInput = {
      ...(status ? { status: this.toPrismaStatus(status) } : {}),
      ...(search
        ? {
            OR: [
              { projectName: { contains: search, mode: "insensitive" } },
              {
                client: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
      ...(clientName
        ? {
            client: {
              name: { contains: clientName, mode: "insensitive" },
            },
          }
        : {}),
      ...(projectName
        ? { projectName: { contains: projectName, mode: "insensitive" } }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          client: {
            select: {
              name: true,
            },
          },
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.quote.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: data.map((quote) => this.toDomainQuote(quote)),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findById(id: string): Promise<QuoteWithClient | null> {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        items: true,
      },
    });

    if (!quote) {
      return null;
    }

    return this.toDomainQuote(quote);
  }

  async create(data: CreateQuoteData): Promise<QuoteWithClient> {
    const quote = await prisma.quote.create({
      data: {
        clientId: data.clientId,
        projectName: data.projectName,
        subtotal: data.subtotal,
        discount: data.discount,
        discountType: this.toPrismaDiscountType(data.discountType),
        totalValue: data.totalValue,
        status: this.toPrismaStatus(data.status),
        termsAndConditions: data.termsAndConditions ?? null,
        publicLink: data.publicLink ?? null,
        sentAt: data.sentAt,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
        items: true,
      },
    });

    return this.toDomainQuote(quote);
  }

  async update(
    id: string,
    data: UpdateQuoteData
  ): Promise<QuoteWithClient | null> {
    const existing = await prisma.quote.findUnique({
      where: { id },
    });

    if (!existing) {
      return null;
    }

    const quote = await prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.quoteItem.deleteMany({
          where: { quoteId: id },
        });
      }

      return tx.quote.update({
        where: { id },
        data: {
          ...(data.clientId ? { clientId: data.clientId } : {}),
          ...(data.projectName ? { projectName: data.projectName } : {}),
          ...(data.subtotal !== undefined ? { subtotal: data.subtotal } : {}),
          ...(data.discount !== undefined ? { discount: data.discount } : {}),
          ...(data.discountType
            ? { discountType: this.toPrismaDiscountType(data.discountType) }
            : {}),
          ...(data.totalValue !== undefined
            ? { totalValue: data.totalValue }
            : {}),
          ...(data.status ? { status: this.toPrismaStatus(data.status) } : {}),
          ...(data.termsAndConditions !== undefined
            ? { termsAndConditions: data.termsAndConditions }
            : {}),
          ...(data.publicLink !== undefined
            ? { publicLink: data.publicLink }
            : {}),
          ...(data.sentAt ? { sentAt: data.sentAt } : {}),
          ...(data.items
            ? {
                items: {
                  create: data.items.map((item) => ({
                    description: item.description,
                    quantity: Number(item.quantity),
                    unitPrice: item.unitPrice,
                    totalPrice: item.quantity * item.unitPrice,
                  })),
                },
              }
            : {}),
        },
        include: {
          client: {
            select: {
              name: true,
            },
          },
          items: true,
        },
      });
    });

    return this.toDomainQuote(quote);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await prisma.quote.findUnique({
      where: { id },
    });

    if (!existing) {
      return false;
    }

    await prisma.quote.delete({
      where: { id },
    });

    return true;
  }

  async getApprovedTotalInRange(
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const result = await prisma.quote.aggregate({
      where: {
        status: PrismaQuoteStatus.APPROVED,
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalValue: true,
      },
    });

    return Number(result._sum.totalValue ?? 0);
  }

  async countByStatusInRange(
    status: QuoteStatus,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    return prisma.quote.count({
      where: {
        status: this.toPrismaStatus(status),
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  async countAllInRange(startDate: Date, endDate: Date): Promise<number> {
    return prisma.quote.count({
      where: {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private toDomainQuote(
    quote: Prisma.QuoteGetPayload<{
      include: {
        client: { select: { name: true } };
        items: true;
      };
    }>
  ): QuoteWithClient {
    return {
      id: quote.id,
      clientId: quote.clientId,
      clientName: quote.client.name,
      projectName: quote.projectName,
      subtotal: Number(quote.subtotal),
      discount: Number(quote.discount),
      discountType: quote.discountType as DiscountType,
      totalValue: Number(quote.totalValue),
      status: quote.status as QuoteStatus,
      termsAndConditions: quote.termsAndConditions,
      publicLink: quote.publicLink,
      sentAt: quote.sentAt,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      items: quote.items.map((item) => ({
        id: item.id,
        quoteId: item.quoteId,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }

  private toPrismaStatus(status: QuoteStatus): PrismaQuoteStatus {
    switch (status) {
      case QuoteStatus.APPROVED:
        return PrismaQuoteStatus.APPROVED;
      case QuoteStatus.PENDING:
        return PrismaQuoteStatus.PENDING;
      case QuoteStatus.REJECTED:
        return PrismaQuoteStatus.REJECTED;
    }
  }

  private toPrismaDiscountType(
    discountType: DiscountType
  ): PrismaDiscountType {
    switch (discountType) {
      case DiscountType.FIXED:
        return PrismaDiscountType.FIXED;
      case DiscountType.PERCENTAGE:
        return PrismaDiscountType.PERCENTAGE;
    }
  }
}