import { Router } from "express";
import * as carController from "../controllers/carController.js";

const router = Router();

router.get("/", carController.getCars);
router.post("/", carController.createCar);

router.get("/status/:status", carController.getCarsByStatus);
router.get("/make/:make", carController.getCarsByMake);

router.get("/:id", carController.getCar);
router.put("/:id", carController.updateCar);
router.delete("/:id", carController.deleteCar);

export default router;
