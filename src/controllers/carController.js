import * as carService from "../services/carService.js";

export function getCars(req, res) {
  const cars = carService.getAllCars();

  res.json(cars);
}

export function getCar(req, res) {
  const car = carService.getCarById(req.params.id);

  res.json(car);
}