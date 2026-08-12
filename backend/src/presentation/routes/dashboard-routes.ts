import { Router } from "express";
import { DashboardController } from "../controllers/dashboard-controller";
import { Container } from "../../shared/container";
import { asyncHandler } from "../middlewares/async-handler";

/**
 * Dashboard Routes
 *
 * Defines the HTTP endpoints for the Dashboard screen.
 * Uses the DI container to resolve the controller with its dependencies.
 */
const router = Router();

const controller = new DashboardController(Container.getDashboardService());

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get full Dashboard data
 *     description: |
 *       Returns the complete Dashboard screen payload (BFF pattern):
 *       the "Visão Geral" KPI cards and the "Histórico Recente" paginated table.
 *       The front-end can render the entire screen with a single request.
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for the recent quotes table
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [APPROVED, PENDING, REJECTED]
 *         description: Filter recent quotes by status
 *       - in: query
 *         name: clientName
 *         schema:
 *           type: string
 *         description: Filter recent quotes by client name (partial match)
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   description: "Visão Geral — KPI cards"
 *                   properties:
 *                     approvedQuotes:
 *                       type: object
 *                       properties:
 *                         totalValue:
 *                           type: number
 *                           example: 12450
 *                         formattedValue:
 *                           type: string
 *                           example: "R$ 12.450,00"
 *                         percentageChange:
 *                           type: number
 *                           example: 12
 *                         isPositiveChange:
 *                           type: boolean
 *                           example: true
 *                     awaitingResponse:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: number
 *                           example: 3
 *                     conversionRate:
 *                       type: object
 *                       properties:
 *                         rate:
 *                           type: number
 *                           example: 68
 *                         formattedRate:
 *                           type: string
 *                           example: "68%"
 *                         variation:
 *                           type: number
 *                           example: 4
 *                         isPositiveVariation:
 *                           type: boolean
 *                           example: true
 *                 recentQuotes:
 *                   type: object
 *                   description: "Histórico Recente — paginated table"
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           createdAt:
 *                             type: string
 *                             example: "12/10/2023"
 *                           clientName:
 *                             type: string
 *                             example: "João da Silva"
 *                           projectName:
 *                             type: string
 *                             example: "Armários Cozinha"
 *                           totalValue:
 *                             type: number
 *                             example: 4500
 *                           formattedValue:
 *                             type: string
 *                             example: "R$ 4.500,00"
 *                           status:
 *                             type: string
 *                             enum: [APPROVED, PENDING, REJECTED]
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 24
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         summary:
 *                           type: string
 *                           example: "Mostrando 4 de 24 registros"
 *       500:
 *         description: Internal server error
 */
router.get("/", asyncHandler((req, res) => controller.getDashboard(req, res)));

export default router;