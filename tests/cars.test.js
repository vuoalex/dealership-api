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

describe("PUT /api/cars/:id", () => {
  it("updates a car and returns the new version", async () => {
    const created = insertCar();

    const response = await request(app)
      .put(`/api/cars/${created.id}`)
      .send({ ...sampleCar, price: 195000, mileage: 9200, status: "reserved" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: created.id,
      price: 195000,
      mileage: 9200,
      status: "reserved",
    });
  });

  it("saves the changes to the database", async () => {
    const created = insertCar();

    await request(app)
      .put(`/api/cars/${created.id}`)
      .send({ ...sampleCar, price: 195000 });

    const response = await request(app).get(`/api/cars/${created.id}`);

    expect(response.body.price).toBe(195000);
  });

  it("can change the registration number", async () => {
    const created = insertCar({ registration_number: "ABC123" });

    const response = await request(app)
      .put(`/api/cars/${created.id}`)
      .send({ ...sampleCar, registration_number: "XYZ789" });

    expect(response.status).toBe(200);
    expect(response.body.registration_number).toBe("XYZ789");
  });

  it("returns 404 when no car has the given id", async () => {
    const response = await request(app).put("/api/cars/9999").send(sampleCar);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 400 when a required field is missing", async () => {
    const created = insertCar();
    const { model, ...carWithoutModel } = sampleCar;

    const response = await request(app)
      .put(`/api/cars/${created.id}`)
      .send(carWithoutModel);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("returns 409 when the registration number belongs to another car", async () => {
    const first = insertCar({ registration_number: "ABC123" });
    insertCar({ registration_number: "XYZ789" });

    const response = await request(app)
      .put(`/api/cars/${first.id}`)
      .send({ ...sampleCar, registration_number: "XYZ789" });

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
  });

  it("allows keeping the same registration number", async () => {
    const created = insertCar({ registration_number: "ABC123" });

    const response = await request(app)
      .put(`/api/cars/${created.id}`)
      .send({ ...sampleCar, price: 150000 });

    expect(response.status).toBe(200);
    expect(response.body.registration_number).toBe("ABC123");
  });
});

describe("DELETE /api/cars/:id", () => {
  it("deletes the car and returns no content", async () => {
    const created = insertCar();

    const response = await request(app).delete(`/api/cars/${created.id}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("removes the car from the database", async () => {
    const created = insertCar();

    await request(app).delete(`/api/cars/${created.id}`);

    const response = await request(app).get(`/api/cars/${created.id}`);

    expect(response.status).toBe(404);
  });

  it("leaves other cars untouched", async () => {
    const first = insertCar({ registration_number: "ABC123" });
    insertCar({ registration_number: "XYZ789" });

    await request(app).delete(`/api/cars/${first.id}`);

    const response = await request(app).get("/api/cars");

    expect(response.body).toHaveLength(1);
    expect(response.body[0].registration_number).toBe("XYZ789");
  });

  it("returns 404 when no car has the given id", async () => {
    const response = await request(app).delete("/api/cars/9999");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });
});

describe("GET /api/cars/status/:status", () => {
  it("returns only cars with the given status", async () => {
    insertCar({ registration_number: "ABC123", status: "available" });
    insertCar({ registration_number: "DEF456", status: "sold" });
    insertCar({ registration_number: "GHI789", status: "available" });

    const response = await request(app).get("/api/cars/status/available");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body.every((car) => car.status === "available")).toBe(true);
  });

  it("returns an empty array when no car has that status", async () => {
    insertCar({ status: "available" });

    const response = await request(app).get("/api/cars/status/sold");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 400 for a status that does not exist", async () => {
    const response = await request(app).get("/api/cars/status/purple");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});

describe("GET /api/cars/make/:make", () => {
  it("returns only cars of the given make", async () => {
    insertCar({ registration_number: "ABC123", make: "Volvo" });
    insertCar({ registration_number: "DEF456", make: "Toyota" });

    const response = await request(app).get("/api/cars/make/Volvo");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].make).toBe("Volvo");
  });

  it("matches the make regardless of casing", async () => {
    insertCar({ make: "Volvo" });

    const response = await request(app).get("/api/cars/make/volvo");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("returns an empty array for a make that is not in stock", async () => {
    insertCar({ make: "Volvo" });

    const response = await request(app).get("/api/cars/make/Ferrari");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});