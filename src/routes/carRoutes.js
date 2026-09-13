import { Router } from "express";
import * as carController from "../controllers/carController.js";

const router = Router();

router.get("/", carController.getCars);
router.get("/:id", carController.getCar);
router.post("/", carController.createCar);
router.put("/:id", carController.updateCar);
router.delete("/:id", carController.deleteCar);

export default router;
