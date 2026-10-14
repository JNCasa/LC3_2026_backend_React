import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { FRONTEND_ORIGIN, PORT } from "./config.js";
import { sequelize } from "./db.js";
import "./models/associations.js";
import productRoutes from "../routes/products.routes.js";
import userRoutes from "../routes/users.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin === FRONTEND_ORIGIN) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/productos", productRoutes);
app.use("/api/usuarios", userRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({
      message: "No se puede completar la operación porque hay registros relacionados.",
    });
  }
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({ message: "Los datos enviados no son válidos." });
  }
  res.status(500).json({ message: "Error interno del servidor." });
});

try {
  await sequelize.authenticate();
  await sequelize.query("PRAGMA foreign_keys = ON");
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Base SQLite conectada: ${sequelize.options.storage}`);
  });
} catch (error) {
  console.error("No se pudo conectar con la base SQLite:", error);
  process.exitCode = 1;
}
