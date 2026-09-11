import "../src/config/env.js";
import db from "../src/config/db.js";

const CURRENT_YEAR = new Date().getFullYear();
const VALUE_RETAINED_PER_YEAR = 0.88;
const MINIMUM_PRICE = 30000;

const MODELS = [
  { make: "Volvo", model: "V60", fuels: ["petrol", "diesel", "hybrid"], basePrice: 520000 },
  { make: "Volvo", model: "XC40", fuels: ["petrol", "diesel", "hybrid"], minYear: 2018, basePrice: 480000 },
  { make: "Volvo", model: "XC60", fuels: ["petrol", "diesel", "hybrid"], basePrice: 620000 },
  { make: "Volkswagen", model: "Golf", fuels: ["petrol", "diesel", "hybrid"], basePrice: 330000 },
  { make: "Volkswagen", model: "Passat", fuels: ["petrol", "diesel", "hybrid"], basePrice: 420000 },
  { make: "Volkswagen", model: "ID.4", fuels: ["electric"], minYear: 2021, basePrice: 520000 },
  { make: "Toyota", model: "Auris", fuels: ["petrol", "diesel", "hybrid"], maxYear: 2018, basePrice: 250000 },
  { make: "Toyota", model: "Corolla", fuels: ["petrol", "hybrid"], minYear: 2019, basePrice: 300000 },
  { make: "Toyota", model: "RAV4", fuels: ["petrol", "hybrid"], basePrice: 450000 },
  { make: "Audi", model: "A4", fuels: ["petrol", "diesel"], basePrice: 480000 },
  { make: "Audi", model: "Q5", fuels: ["petrol", "diesel", "hybrid"], basePrice: 620000 },
  { make: "BMW", model: "320i", fuels: ["petrol"], basePrice: 470000 },
  { make: "BMW", model: "520d", fuels: ["diesel"], basePrice: 590000 },
  { make: "Kia", model: "Ceed", fuels: ["petrol", "diesel", "hybrid"], basePrice: 280000 },
  { make: "Kia", model: "Niro", fuels: ["hybrid", "electric"], minYear: 2017, basePrice: 380000 },
  { make: "Hyundai", model: "Kona", fuels: ["petrol", "electric"], minYear: 2018, basePrice: 360000 },
  { make: "Skoda", model: "Octavia", fuels: ["petrol", "diesel", "hybrid"], basePrice: 340000 },
  { make: "Ford", model: "Focus", fuels: ["petrol", "diesel"], basePrice: 290000 },
  { make: "Ford", model: "Kuga", fuels: ["petrol", "diesel", "hybrid"], basePrice: 400000 },
  { make: "Mazda", model: "CX-5", fuels: ["petrol", "diesel"], basePrice: 410000 },
  { make: "Nissan", model: "Leaf", fuels: ["electric"], minYear: 2013, basePrice: 340000 },
  { make: "Tesla", model: "Model 3", fuels: ["electric"], minYear: 2019, basePrice: 500000 },
  { make: "Mercedes-Benz", model: "C 200", fuels: ["petrol", "hybrid"], basePrice: 550000 },
  { make: "Seat", model: "Leon", fuels: ["petrol", "diesel", "hybrid"], basePrice: 310000 },
  { make: "Opel", model: "Astra", fuels: ["petrol", "diesel"], basePrice: 300000 },
];

const OLDEST_YEAR = 2012;

const TRANSMISSIONS = ["manual", "automatic"];

// `available` is repeated to weight the distribution towards cars in stock.
const STATUSES = ["available", "available", "available", "reserved", "sold"];

const LETTERS = "ABCDEFGHJKLMNOPRSTUWXYZ";

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createRegistrationNumber(used) {
  while (true) {
    const letters = Array.from({ length: 3 }, () => pick([...LETTERS])).join("");
    const digits = String(randomInt(0, 999)).padStart(3, "0");
    const candidate = `${letters}${digits}`;

    if (!used.has(candidate)) {
      used.add(candidate);
      return candidate;
    }
  }
}

function createCar(used) {
  const {
    make,
    model,
    fuels,
    basePrice,
    minYear = OLDEST_YEAR,
    maxYear = CURRENT_YEAR,
  } = pick(MODELS);

  const fuel = pick(fuels);
  const year = randomInt(minYear, maxYear);
  const age = CURRENT_YEAR - year;

  // Depreciate from new price, then vary by +-10%.
  const depreciatedPrice = basePrice * Math.pow(VALUE_RETAINED_PER_YEAR, age);
  const price = Math.max(MINIMUM_PRICE, Math.round((depreciatedPrice * randomInt(90, 110)) / 100000) * 1000);

  return {
    registration_number: createRegistrationNumber(used),
    make,
    model,
    year,
    // Roughly 1000-2000 mil per year of age + base mileage
    mileage: randomInt(200, 800) + age * randomInt(1000, 2000),
    fuel,
    transmission: fuel === "electric" ? "automatic" : pick(TRANSMISSIONS),
    price,
    status: pick(STATUSES),
  };
}

const CAR_COUNT = 50;

const insert = db.prepare(`
  INSERT INTO cars
    (registration_number, make, model, year, mileage, fuel, transmission, price, status)
  VALUES
    (@registration_number, @make, @model, @year, @mileage, @fuel, @transmission, @price, @status)
`);

const seed = db.transaction((cars) => {
  db.exec("DELETE FROM cars");
  for (const car of cars) insert.run(car);
});

const used = new Set();
const cars = Array.from({ length: CAR_COUNT }, () => createCar(used));

seed(cars);

console.log(`Seeded ${CAR_COUNT} cars.`);