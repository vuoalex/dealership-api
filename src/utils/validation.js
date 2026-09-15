import { AppError } from "./AppError.js";

const CURRENT_YEAR = new Date().getFullYear();

const REGISTRATION_NUMBER_PATTERN = /^[A-Z]{3}\d{3}$/;

const OLDEST_YEAR = 1900;
const NEWEST_YEAR = CURRENT_YEAR;

export const VALID_FUELS = ["petrol", "diesel", "electric", "hybrid"];
export const VALID_TRANSMISSIONS = ["manual", "automatic"];
export const VALID_STATUSES = ["available", "reserved", "sold"];

function requireString(value, field) {
  if (typeof value !== "string") {
    throw new AppError(`${field} must be text`, 400);
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    throw new AppError(`${field} cannot be empty`, 400);
  }

  return trimmed;
}

function requireWholeNumber(value, field) {
  if (!Number.isInteger(value)) {
    throw new AppError(`${field} must be a whole number`, 400);
  }

  return value;
}

function requireOneOf(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw new AppError(`${field} must be one of: ${allowed.join(", ")}`, 400);
  }

  return value;
}

// Returns a clean object holding only known columns, with text trimmed.
// Throws AppError with status 400 on the first invalid field.
export function validateCar(data) {
  const registrationNumber = requireString(
    data.registration_number,
    "registration_number",
  ).toUpperCase();

  if (!REGISTRATION_NUMBER_PATTERN.test(registrationNumber)) {
    throw new AppError(
      "registration_number must be three letters followed by three digits",
      400,
    );
  }

  const year = requireWholeNumber(data.year, "year");

  if (year < OLDEST_YEAR || year > NEWEST_YEAR) {
    throw new AppError(
      `year must be between ${OLDEST_YEAR} and ${NEWEST_YEAR}`,
      400,
    );
  }

  const mileage = requireWholeNumber(data.mileage, "mileage");

  if (mileage < 0) {
    throw new AppError("mileage cannot be negative", 400);
  }

  const price = requireWholeNumber(data.price, "price");

  if (price <= 0) {
    throw new AppError("price must be higher than zero", 400);
  }

  return {
    registration_number: registrationNumber,
    make: requireString(data.make, "make"),
    model: requireString(data.model, "model"),
    year,
    mileage,
    fuel: requireOneOf(data.fuel, VALID_FUELS, "fuel"),
    transmission: requireOneOf(data.transmission, VALID_TRANSMISSIONS, "transmission"),
    price,
    status: requireOneOf(data.status ?? "available", VALID_STATUSES, "status"),
  };
}