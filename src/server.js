import "./config/env.js";
import app from "./app.js";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`\x1b[32m
    Listening on http://localhost:${PORT}
    \x1b[0m`);
});
