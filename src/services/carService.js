import db from "../config/db.js";
import { AppError } from "../utils/AppError.js";

const REQUIRED_FIELDS = [
  "registration_number",
  "make",
  "model",
  "year",
  "mileage",
  "fuel",
  "transmission",
  "price",
];

const DEFAULT_STATUS = "available";

function findMissingFields(data) {
  return REQUIRED_FIELDS.filter((field) => data[field] === undefined);
}

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

export function createCar(data) {
  const missing = findMissingFields(data);

  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(", ")}`, 400);
  }

  const existing = db
    .prepare("SELECT id FROM cars WHERE registration_number = ?")
    .get(data.registration_number);

  if (existing) {
    throw new AppError(
      "A car with that registration number already exists",
      409,
    );
  }

  return db
    .prepare(
      `INSERT INTO cars
        (registration_number, make, model, year, mileage, fuel, transmission, price, status)
       VALUES
        (@registration_number, @make, @model, @year, @mileage, @fuel, @transmission, @price, @status)
       RETURNING *`,
    )
    .get({
      registration_number: data.registration_number,
      make: data.make,
      model: data.model,
      year: data.year,
      mileage: data.mileage,
      fuel: data.fuel,
      transmission: data.transmission,
      price: data.price,
      status: data.status ?? DEFAULT_STATUS,
    });
}
