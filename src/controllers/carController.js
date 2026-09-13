import * as carService from "../services/carService.js";

export function getCars(req, res) {
  const result = carService.getAllCars(req.query);

  res.json(result);
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

export function deleteCar(req, res) {
  carService.deleteCar(req.params.id);

  res.sendStatus(204);
}

export function getCarsByStatus(req, res) {
  const cars = carService.getCarsByStatus(req.params.status);

  res.json(cars);
}

export function getCarsByMake(req, res) {
  const cars = carService.getCarsByMake(req.params.make);

  res.json(cars);
}
