import { Router } from "express";
import * as carController from "../controllers/carController.js";

const router = Router();

router.get("/", carController.getCars);

export default router;
