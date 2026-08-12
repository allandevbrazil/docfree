import { Router } from "express";
import { QuoteController } from "../controllers/quote-controller";
import { Container } from "../../shared/container";
import { asyncHandler } from "../middlewares/async-handler";

/**
 * Quote Routes
 *
 * Defines the HTTP endpoints for the Quote feature.
 * Uses the DI container to resolve the controller with its dependencies.
 */
const router = Router();

const controller = new QuoteController(
  Container.getCreateQuoteUseCase(),
  Container.getGetQuoteUseCase(),
  Container.getListQuotesUseCase(),
  Container.getUpdateQuoteUseCase(),
  Container.getDeleteQuoteUseCase()
);

/**
 * @swagger
 * /quotes:
 *   get:
 *     summary: List quotes
 *     description: |
 *       Returns a paginated list of quotes with optional filters.
 *       The response is formatted for the front-end table (BFF pattern).
 *     tags: [Quotes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [APPROVED, PENDING, REJECTED]
 *         description: Filter by quote status
 *       - in: query
 *         name: clientName
 *         schema:
 *           type: string
 *         description: Filter by client name (partial match)
 *       - in: query
 *         name: projectName
 *         schema:
 *           type: string
 *         description: Filter by project name (partial match)
 *     responses:
 *       200:
 *         description: Quotes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Quote"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 24
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     summary:
 *                       type: string
 *                       example: "Mostrando 10 de 24 registros"
 *       500:
 *         description: Internal server error
 *
 *   post:
 *     summary: Create a new quote
 *     description: Creates a new quote with items, discount and terms.
 *     tags: [Quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientId, projectName, items]
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *                 example: "3f2b1c4e-8a9d-4f6b-9c2e-1a2b3c4d5e6f"
 *               projectName:
 *                 type: string
 *                 example: "Armários Cozinha"
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [description, quantity, unitPrice]
 *                   properties:
 *                     description:
 *                       type: string
 *                       example: "Armário planejado 2m"
 *                     quantity:
 *                       type: number
 *                       example: 1
 *                     unitPrice:
 *                       type: number
 *                       example: 4500
 *               discount:
 *                 type: number
 *                 example: 0
 *               discountType:
 *                 type: string
 *                 enum: [FIXED, PERCENTAGE]
 *                 default: FIXED
 *               termsAndConditions:
 *                 type: string
 *                 example: "Pagamento em 2x sem juros"
 *               status:
 *                 type: string
 *                 enum: [APPROVED, PENDING, REJECTED]
 *                 default: PENDING
 *               sentAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-10-12T10:00:00.000Z"
 *     responses:
 *       201:
 *         description: Quote created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Quote"
 *       400:
 *         description: Validation error (missing fields or client not found)
 *       500:
 *         description: Internal server error
 *
 * /quotes/{id}:
 *   get:
 *     summary: Get a quote by ID
 *     description: Returns a single quote by its unique identifier.
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Quote unique identifier
 *     responses:
 *       200:
 *         description: Quote retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Quote"
 *       404:
 *         description: Quote not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a quote
 *     description: Updates an existing quote with partial data.
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Quote unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *               projectName:
 *                 type: string
 *                 example: "Armários Cozinha + Bancada"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *               discount:
 *                 type: number
 *               discountType:
 *                 type: string
 *                 enum: [FIXED, PERCENTAGE]
 *               termsAndConditions:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [APPROVED, PENDING, REJECTED]
 *               sentAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Quote updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Quote"
 *       400:
 *         description: Validation error
 *       404:
 *         description: Quote not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a quote
 *     description: Deletes a quote by its unique identifier.
 *     tags: [Quotes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Quote unique identifier
 *     responses:
 *       204:
 *         description: Quote deleted successfully
 *       404:
 *         description: Quote not found
 *       500:
 *         description: Internal server error
 */
router.get("/", asyncHandler((req, res) => controller.list(req, res)));

router.get("/:id", asyncHandler((req, res) => controller.getById(req, res)));

router.post("/", asyncHandler((req, res) => controller.create(req, res)));

router.put("/:id", asyncHandler((req, res) => controller.update(req, res)));

router.delete("/:id", asyncHandler((req, res) => controller.delete(req, res)));

export default router;