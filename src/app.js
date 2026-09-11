import express from "express";
import carRoutes from "./routes/carRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(express.json());

app.use("/api/cars", carRoutes);

app.use(errorHandler);

export default app;
