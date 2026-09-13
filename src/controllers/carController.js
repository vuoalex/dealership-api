import * as carService from "../services/carService.js";

export function getCars(req, res) {
  const cars = carService.getAllCars();

  res.json(cars);
}

export function getCar(req, res) {
  const car = carService.getCarById(req.params.id);

  res.json(car);
}

export function createCar(req, res) {
  const car = carService.createCar(req.body);

  res.status(201).json(car);
}

export function updateCar(req, res) {
  const car = carService.updateCar(req.params.id, req.body);

  res.json(car);
}
