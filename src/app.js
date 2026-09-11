import express from "express";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(express.json());

// routes

app.use(errorHandler);

export default app;
