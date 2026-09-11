import db from "../config/db.js";

export function getAllCars() {
  return db.prepare("SELECT * FROM cars").all();
}
