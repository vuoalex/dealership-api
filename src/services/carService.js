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
const VALID_STATUSES = ["available", "reserved", "sold"];

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function findMissingFields(data) {
  return REQUIRED_FIELDS.filter((field) => data[field] === undefined);
}

export function getAllCars({ page = 1, limit = DEFAULT_LIMIT } = {}) {
  const pageNumber = Number(page);
  const pageSize = Number(limit);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new AppError("Page must be a positive whole number", 400);
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new AppError("Limit must be a positive whole number", 400);
  }

  if (pageSize > MAX_LIMIT) {
    throw new AppError(`Limit cannot be higher than ${MAX_LIMIT}`, 400);
  }

  const { total } = db.prepare("SELECT COUNT(*) AS total FROM cars").get();

  const cars = db
    .prepare("SELECT * FROM cars LIMIT ? OFFSET ?")
    .all(pageSize, (pageNumber - 1) * pageSize);

  return {
    data: cars,
    page: pageNumber,
    limit: pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
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

export function updateCar(id, data) {
  const existing = db.prepare("SELECT id FROM cars WHERE id = ?").get(id);

  if (!existing) {
    throw new AppError("Car not found", 404);
  }

  const missing = findMissingFields(data);

  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(", ")}`, 400);
  }

  const duplicate = db
    .prepare("SELECT id FROM cars WHERE registration_number = ? AND id != ?")
    .get(data.registration_number, id);

  if (duplicate) {
    throw new AppError(
      "A car with that registration number already exists",
      409,
    );
  }

  return db
    .prepare(
      `UPDATE cars SET
        registration_number = @registration_number,
        make = @make,
        model = @model,
        year = @year,
        mileage = @mileage,
        fuel = @fuel,
        transmission = @transmission,
        price = @price,
        status = @status
       WHERE id = @id
       RETURNING *`,
    )
    .get({
      id,
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

export function deleteCar(id) {
  const existing = db.prepare("SELECT id FROM cars WHERE id = ?").get(id);

  if (!existing) {
    throw new AppError("Car not found", 404);
  }

  db.prepare("DELETE FROM cars WHERE id = ?").run(id);
}

export function getCarsByStatus(status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(
      `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      400,
    );
  }

  return db.prepare("SELECT * FROM cars WHERE status = ?").all(status);
}

export function getCarsByMake(make) {
  return db
    .prepare("SELECT * FROM cars WHERE make = ? COLLATE NOCASE")
    .all(make);
}
