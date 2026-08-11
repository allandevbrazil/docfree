import { Router } from "express";
import { ClientController } from "../controllers/client-controller";
import { Container } from "../../shared/container";

/**
 * Client Routes
 *
 * Defines the HTTP endpoints for the Client feature.
 * Uses the DI container to resolve the controller with its dependencies.
 */
const router = Router();

const controller = new ClientController(
  Container.getCreateClientUseCase(),
  Container.getGetClientUseCase(),
  Container.getListClientsUseCase(),
  Container.getUpdateClientUseCase(),
  Container.getDeleteClientUseCase()
);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: List clients
 *     description: |
 *       Returns a paginated list of clients with optional filters.
 *       The response is formatted for the front-end table (BFF pattern).
 *     tags: [Clients]
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
 *           maximum: 50
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email or company (partial match)
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city (partial match)
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state (e.g. SP, RJ, MG)
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Client"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 24
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
 *     summary: Create a new client
 *     description: Creates a new client with the provided data.
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João da Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.silva@email.com"
 *               phone:
 *                 type: string
 *                 example: "(11) 98765-4321"
 *               company:
 *                 type: string
 *                 example: "Casa do João"
 *               cep:
 *                 type: string
 *                 example: "01310-100"
 *               street:
 *                 type: string
 *                 example: "Av. Paulista"
 *               number:
 *                 type: string
 *                 example: "1000"
 *               neighborhood:
 *                 type: string
 *                 example: "Bela Vista"
 *               city:
 *                 type: string
 *                 example: "São Paulo"
 *               state:
 *                 type: string
 *                 example: "SP"
 *               notes:
 *                 type: string
 *                 example: "Cliente prefere contato por WhatsApp"
 *     responses:
 *       201:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Client"
 *       400:
 *         description: Validation error (missing name/email or duplicate email)
 *       500:
 *         description: Internal server error
 *
 * /clients/{id}:
 *   get:
 *     summary: Get a client by ID
 *     description: Returns a single client by its unique identifier.
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client unique identifier
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Client"
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 *
 *   put:
 *     summary: Update a client
 *     description: Updates an existing client with partial data.
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João da Silva Santos"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao.santos@email.com"
 *               phone:
 *                 type: string
 *                 example: "(11) 91234-5678"
 *               company:
 *                 type: string
 *                 example: "Casa do João"
 *               cep:
 *                 type: string
 *                 example: "01310-100"
 *               street:
 *                 type: string
 *                 example: "Av. Paulista"
 *               number:
 *                 type: string
 *                 example: "1000"
 *               neighborhood:
 *                 type: string
 *                 example: "Bela Vista"
 *               city:
 *                 type: string
 *                 example: "São Paulo"
 *               state:
 *                 type: string
 *                 example: "SP"
 *               notes:
 *                 type: string
 *                 example: "Cliente prefere contato por e-mail"
 *     responses:
 *       200:
 *         description: Client updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Client"
 *       400:
 *         description: Validation error (duplicate email)
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 *
 *   delete:
 *     summary: Delete a client
 *     description: Deletes a client by its unique identifier.
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Client unique identifier
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.get("/", (req, res) => {
  void controller.list(req, res);
});

router.get("/:id", (req, res) => {
  void controller.getById(req, res);
});

router.post("/", (req, res) => {
  void controller.create(req, res);
});

router.put("/:id", (req, res) => {
  void controller.update(req, res);
});

router.delete("/:id", (req, res) => {
  void controller.delete(req, res);
});

export default router;