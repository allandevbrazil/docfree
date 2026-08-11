import { QuoteRepository } from "../domain/repositories/quote-repository";
import { ClientRepository } from "../domain/repositories/client-repository";
import { PrismaQuoteRepository } from "../infrastructure/repositories/prisma-quote-repository";
import { PrismaClientRepository } from "../infrastructure/repositories/prisma-client-repository";
import { GetDashboardMetricsUseCase } from "../application/use-cases/get-dashboard-metrics-use-case";
import { GetRecentQuotesUseCase } from "../application/use-cases/get-recent-quotes-use-case";
import { DashboardService } from "../application/services/dashboard-service";
import { CreateClientUseCase } from "../application/use-cases/clients/create-client-use-case";
import { GetClientUseCase } from "../application/use-cases/clients/get-client-use-case";
import { ListClientsUseCase } from "../application/use-cases/clients/list-clients-use-case";
import { UpdateClientUseCase } from "../application/use-cases/clients/update-client-use-case";
import { DeleteClientUseCase } from "../application/use-cases/clients/delete-client-use-case";
import { CreateQuoteUseCase } from "../application/use-cases/quotes/create-quote-use-case";
import { GetQuoteUseCase } from "../application/use-cases/quotes/get-quote-use-case";
import { ListQuotesUseCase } from "../application/use-cases/quotes/list-quotes-use-case";
import { UpdateQuoteUseCase } from "../application/use-cases/quotes/update-quote-use-case";
import { DeleteQuoteUseCase } from "../application/use-cases/quotes/delete-quote-use-case";

/**
 * Dependency Injection Container
 *
 * Simple manual DI container that wires up all dependencies.
 * This keeps the composition root in one place and makes
 * testing easy (repositories can be swapped for mocks).
 */
export class Container {
  private static quoteRepositoryInstance: QuoteRepository;
  private static clientRepositoryInstance: ClientRepository;
  private static getDashboardMetricsUseCaseInstance: GetDashboardMetricsUseCase;
  private static getRecentQuotesUseCaseInstance: GetRecentQuotesUseCase;
  private static dashboardServiceInstance: DashboardService;
  private static createClientUseCaseInstance: CreateClientUseCase;
  private static getClientUseCaseInstance: GetClientUseCase;
  private static listClientsUseCaseInstance: ListClientsUseCase;
  private static updateClientUseCaseInstance: UpdateClientUseCase;
  private static deleteClientUseCaseInstance: DeleteClientUseCase;
  private static createQuoteUseCaseInstance: CreateQuoteUseCase;
  private static getQuoteUseCaseInstance: GetQuoteUseCase;
  private static listQuotesUseCaseInstance: ListQuotesUseCase;
  private static updateQuoteUseCaseInstance: UpdateQuoteUseCase;
  private static deleteQuoteUseCaseInstance: DeleteQuoteUseCase;

  static getQuoteRepository(): QuoteRepository {
    if (!this.quoteRepositoryInstance) {
      this.quoteRepositoryInstance = new PrismaQuoteRepository();
    }
    return this.quoteRepositoryInstance;
  }

  static getClientRepository(): ClientRepository {
    if (!this.clientRepositoryInstance) {
      this.clientRepositoryInstance = new PrismaClientRepository();
    }
    return this.clientRepositoryInstance;
  }

  static getGetDashboardMetricsUseCase(): GetDashboardMetricsUseCase {
    if (!this.getDashboardMetricsUseCaseInstance) {
      this.getDashboardMetricsUseCaseInstance = new GetDashboardMetricsUseCase(
        this.getQuoteRepository()
      );
    }
    return this.getDashboardMetricsUseCaseInstance;
  }

  static getGetRecentQuotesUseCase(): GetRecentQuotesUseCase {
    if (!this.getRecentQuotesUseCaseInstance) {
      this.getRecentQuotesUseCaseInstance = new GetRecentQuotesUseCase(
        this.getQuoteRepository()
      );
    }
    return this.getRecentQuotesUseCaseInstance;
  }

  static getDashboardService(): DashboardService {
    if (!this.dashboardServiceInstance) {
      this.dashboardServiceInstance = new DashboardService(
        this.getGetDashboardMetricsUseCase(),
        this.getGetRecentQuotesUseCase()
      );
    }
    return this.dashboardServiceInstance;
  }

  static getCreateClientUseCase(): CreateClientUseCase {
    if (!this.createClientUseCaseInstance) {
      this.createClientUseCaseInstance = new CreateClientUseCase(
        this.getClientRepository()
      );
    }
    return this.createClientUseCaseInstance;
  }

  static getGetClientUseCase(): GetClientUseCase {
    if (!this.getClientUseCaseInstance) {
      this.getClientUseCaseInstance = new GetClientUseCase(
        this.getClientRepository()
      );
    }
    return this.getClientUseCaseInstance;
  }

  static getListClientsUseCase(): ListClientsUseCase {
    if (!this.listClientsUseCaseInstance) {
      this.listClientsUseCaseInstance = new ListClientsUseCase(
        this.getClientRepository()
      );
    }
    return this.listClientsUseCaseInstance;
  }

  static getUpdateClientUseCase(): UpdateClientUseCase {
    if (!this.updateClientUseCaseInstance) {
      this.updateClientUseCaseInstance = new UpdateClientUseCase(
        this.getClientRepository()
      );
    }
    return this.updateClientUseCaseInstance;
  }

  static getDeleteClientUseCase(): DeleteClientUseCase {
    if (!this.deleteClientUseCaseInstance) {
      this.deleteClientUseCaseInstance = new DeleteClientUseCase(
        this.getClientRepository()
      );
    }
    return this.deleteClientUseCaseInstance;
  }

  static getCreateQuoteUseCase(): CreateQuoteUseCase {
    if (!this.createQuoteUseCaseInstance) {
      this.createQuoteUseCaseInstance = new CreateQuoteUseCase(
        this.getQuoteRepository()
      );
    }
    return this.createQuoteUseCaseInstance;
  }

  static getGetQuoteUseCase(): GetQuoteUseCase {
    if (!this.getQuoteUseCaseInstance) {
      this.getQuoteUseCaseInstance = new GetQuoteUseCase(
        this.getQuoteRepository()
      );
    }
    return this.getQuoteUseCaseInstance;
  }

  static getListQuotesUseCase(): ListQuotesUseCase {
    if (!this.listQuotesUseCaseInstance) {
      this.listQuotesUseCaseInstance = new ListQuotesUseCase(
        this.getQuoteRepository()
      );
    }
    return this.listQuotesUseCaseInstance;
  }

  static getUpdateQuoteUseCase(): UpdateQuoteUseCase {
    if (!this.updateQuoteUseCaseInstance) {
      this.updateQuoteUseCaseInstance = new UpdateQuoteUseCase(
        this.getQuoteRepository()
      );
    }
    return this.updateQuoteUseCaseInstance;
  }

  static getDeleteQuoteUseCase(): DeleteQuoteUseCase {
    if (!this.deleteQuoteUseCaseInstance) {
      this.deleteQuoteUseCaseInstance = new DeleteQuoteUseCase(
        this.getQuoteRepository()
      );
    }
    return this.deleteQuoteUseCaseInstance;
  }
}
