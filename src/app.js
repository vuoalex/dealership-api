import express from "express";
import carRoutes from "./routes/carRoutes.js";
import { apiReference } from "@scalar/express-api-reference";
import { openapiSpec } from "./config/openapi.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(express.json());

app.use("/api/cars", carRoutes);

app.get("/", (req, res) => res.redirect("/docs"));
app.get("/openapi.json", (req, res) => res.json(openapiSpec));

app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(errorHandler);

export default app;
