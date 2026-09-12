import db from "../config/db.js";
import { AppError } from "../utils/AppError.js";

export function getAllCars() {
  return db.prepare("SELECT * FROM cars").all();
}

export function getCarById(id) {
  const car = db.prepare("SELECT * FROM cars WHERE id = ?").get(id);

  if (!car) {
    throw new AppError("Car not found", 404);
  }

  return car;
}