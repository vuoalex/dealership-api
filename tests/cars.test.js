import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import db from "../src/config/db.js";

const sampleCar = {
  registration_number: "ABC123",
  make: "Volvo",
  model: "V60",
  year: 2019,
  mileage: 8500,
  fuel: "diesel",
  transmission: "automatic",
  price: 210000,
  status: "available",
};

function insertCar(overrides = {}) {
  const car = { ...sampleCar, ...overrides };

  return db
    .prepare(
      `INSERT INTO cars
        (registration_number, make, model, year, mileage, fuel, transmission, price, status)
       VALUES
        (@registration_number, @make, @model, @year, @mileage, @fuel, @transmission, @price, @status)
       RETURNING *`,
    )
    .get(car);
}

beforeEach(() => {
  db.exec("DELETE FROM cars");
});

afterAll(() => {
  db.close();
});

describe("GET /api/cars", () => {
  it("returns an empty array when there are no cars", async () => {
    const response = await request(app).get("/api/cars");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns all cars in the database", async () => {
    insertCar({ registration_number: "ABC123", make: "Volvo" });
    insertCar({ registration_number: "DEF456", make: "Toyota" });

    const response = await request(app).get("/api/cars");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body.map((car) => car.make)).toEqual(["Volvo", "Toyota"]);
  });

  it("returns cars with the expected shape", async () => {
    insertCar();

    const response = await request(app).get("/api/cars");

    expect(response.body[0]).toMatchObject({
      id: expect.any(Number),
      registration_number: "ABC123",
      make: "Volvo",
      model: "V60",
      year: 2019,
      mileage: 8500,
      fuel: "diesel",
      transmission: "automatic",
      price: 210000,
      status: "available",
      created_at: expect.any(String),
    });
  });
});
