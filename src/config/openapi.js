import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Dealership API",
      version: "1.0.0",
      description:
        "REST API for a car dealership's vehicle inventory. Mileage is given in Swedish mil (1 mil = 10 km).",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local development" },
    ],
    components: {
      schemas: {
        Car: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            registration_number: {
              type: "string",
              pattern: "^[A-Z]{3}\\d{3}$",
              example: "ABC123",
            },
            make: { type: "string", example: "Volvo" },
            model: { type: "string", example: "V60" },
            year: { type: "integer", example: 2019 },
            mileage: { type: "integer", minimum: 0, example: 8500 },
            fuel: {
              type: "string",
              enum: ["petrol", "diesel", "electric", "hybrid"],
              example: "diesel",
            },
            transmission: {
              type: "string",
              enum: ["manual", "automatic"],
              example: "automatic",
            },
            price: { type: "integer", minimum: 1, example: 210000 },
            status: {
              type: "string",
              enum: ["available", "reserved", "sold"],
              example: "available",
            },
            created_at: { type: "string", example: "2026-09-15 14:22:01" },
          },
        },
        CarInput: {
          type: "object",
          required: [
            "registration_number",
            "make",
            "model",
            "year",
            "mileage",
            "fuel",
            "transmission",
            "price",
          ],
          properties: {
            registration_number: { type: "string", example: "ABC123" },
            make: { type: "string", example: "Volvo" },
            model: { type: "string", example: "V60" },
            year: { type: "integer", example: 2019 },
            mileage: { type: "integer", example: 8500 },
            fuel: {
              type: "string",
              enum: ["petrol", "diesel", "electric", "hybrid"],
            },
            transmission: { type: "string", enum: ["manual", "automatic"] },
            price: { type: "integer", example: 210000 },
            status: {
              type: "string",
              enum: ["available", "reserved", "sold"],
              default: "available",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Car not found" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export const openapiSpec = swaggerJsdoc(options);
