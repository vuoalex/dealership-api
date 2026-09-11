import * as carService from "../services/carService.js";

export function getCars(req, res) {
  const cars = carService.getAllCars();

  res.json(cars);
}
