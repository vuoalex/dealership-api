import { Router } from "express";
import * as carController from "../controllers/carController.js";

const router = Router();

/**
 * @openapi
 * /api/cars:
 *   get:
 *     summary: List cars
 *     description: Returns a paginated list of all cars in stock.
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Which page to return.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *         description: How many cars per page.
 *     responses:
 *       200:
 *         description: A page of cars with pagination metadata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Car' }
 *                 page: { type: integer, example: 1 }
 *                 limit: { type: integer, example: 10 }
 *                 total: { type: integer, example: 50 }
 *                 totalPages: { type: integer, example: 5 }
 *       400:
 *         description: Invalid page or limit.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/", carController.getCars);

/**
 * @openapi
 * /api/cars:
 *   post:
 *     summary: Add a car
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CarInput' }
 *     responses:
 *       201:
 *         description: The car that was created.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Car' }
 *       400:
 *         description: A field is missing or invalid.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: The registration number is already in use.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/", carController.createCar);

/**
 * @openapi
 * /api/cars/status/{status}:
 *   get:
 *     summary: List cars by status
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [available, reserved, sold]
 *     responses:
 *       200:
 *         description: Cars with the given status.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Car' }
 *       400:
 *         description: Unknown status.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/status/:status", carController.getCarsByStatus);

/**
 * @openapi
 * /api/cars/make/{make}:
 *   get:
 *     summary: List cars by make
 *     description: Case-insensitive. Returns an empty array if the make is not in stock.
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: make
 *         required: true
 *         schema: { type: string }
 *         example: volvo
 *     responses:
 *       200:
 *         description: Cars of the given make.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Car' }
 */
router.get("/make/:make", carController.getCarsByMake);

/**
 * @openapi
 * /api/cars/{id}:
 *   get:
 *     summary: Get one car
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The car.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Car' }
 *       404:
 *         description: No car with that id.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/:id", carController.getCar);

/**
 * @openapi
 * /api/cars/{id}:
 *   put:
 *     summary: Replace a car
 *     description: All required fields must be sent; omitted optional fields fall back to their defaults.
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CarInput' }
 *     responses:
 *       200:
 *         description: The updated car.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Car' }
 *       400:
 *         description: A field is missing or invalid.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: No car with that id.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: The registration number belongs to another car.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put("/:id", carController.updateCar);

/**
 * @openapi
 * /api/cars/{id}:
 *   delete:
 *     summary: Remove a car
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: The car was deleted. No content is returned.
 *       404:
 *         description: No car with that id.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete("/:id", carController.deleteCar);

export default router;
