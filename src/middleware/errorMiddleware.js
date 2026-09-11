export function errorHandler(err, req, res, next) {
  if (!err.status) {
    console.error(err);
  }

  res
    .status(err.status ?? 500)
    .json({ error: err.message ?? "Internal server error" });
}
