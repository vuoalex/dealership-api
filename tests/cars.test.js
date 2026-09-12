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

describe("GET /api/cars/:id", () => {
  it("returns the car with the given id", async () => {
    const created = insertCar({ registration_number: "XYZ789", make: "Audi" });

    const response = await request(app).get(`/api/cars/${created.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: created.id,
      registration_number: "XYZ789",
      make: "Audi",
    });
  });

  it("returns 404 when no car has the given id", async () => {
    const response = await request(app).get("/api/cars/9999");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 404 if given id is not a number", async () => {
    const response = await request(app).get("/api/cars/not-a-number");

    expect(response.status).toBe(404);
  });
});

describe("POST /api/cars", () => {
  it("creates a car and returns it with a generated id", async () => {
    const response = await request(app).post("/api/cars").send(sampleCar);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
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

  it("saves the created car to the database", async () => {
    await request(app).post("/api/cars").send(sampleCar);

    const response = await request(app).get("/api/cars");

    expect(response.body).toHaveLength(1);
    expect(response.body[0].registration_number).toBe("ABC123");
  });

  it("sets status to available when it is not provided", async () => {
    const { status, ...carWithoutStatus } = sampleCar;

    const response = await request(app)
      .post("/api/cars")
      .send(carWithoutStatus);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("available");
  });

  it("returns 400 when a required field is missing", async () => {
    const { make, ...carWithoutMake } = sampleCar;

    const response = await request(app).post("/api/cars").send(carWithoutMake);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 409 when registration number already exists", async () => {
    insertCar({ registration_number: "ABC123" });

    const response = await request(app).post("/api/cars").send(sampleCar);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
  });
});
