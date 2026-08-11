import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma-client";
import {
  ClientRepository,
  FindClientsParams,
  FindClientsResult,
  CreateClientData,
  UpdateClientData,
} from "../../domain/repositories/client-repository";
import { Client } from "../../domain/entities/client";

/**
 * Prisma Client Repository
 *
 * Implements the ClientRepository interface using Prisma ORM.
 * This is the only layer that talks directly to the database.
 */
export class PrismaClientRepository implements ClientRepository {
  async findById(id: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return null;
    }

    return this.toDomainClient(client);
  }

  async findByEmail(email: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      return null;
    }

    return this.toDomainClient(client);
  }

  async findMany(params: FindClientsParams): Promise<FindClientsResult> {
    const { page, pageSize, search, city, state } = params;

    const where: Prisma.ClientWhereInput = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { company: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(state ? { state: { equals: state, mode: "insensitive" } } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.client.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data: data.map((client) => this.toDomainClient(client)),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async create(data: CreateClientData): Promise<Client> {
    const client = await prisma.client.create({
      data,
    });

    return this.toDomainClient(client);
  }

  async update(id: string, data: UpdateClientData): Promise<Client | null> {
    const existing = await prisma.client.findUnique({
      where: { id },
    });

    if (!existing) {
      return null;
    }

    const client = await prisma.client.update({
      where: { id },
      data,
    });

    return this.toDomainClient(client);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await prisma.client.findUnique({
      where: { id },
    });

    if (!existing) {
      return false;
    }

    await prisma.client.delete({
      where: { id },
    });

    return true;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private toDomainClient(
    client: Prisma.ClientGetPayload<Record<string, never>>
  ): Client {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      cep: client.cep,
      street: client.street,
      number: client.number,
      neighborhood: client.neighborhood,
      city: client.city,
      state: client.state,
      notes: client.notes,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}