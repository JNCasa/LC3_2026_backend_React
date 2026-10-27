import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { FRONTEND_ORIGIN, PORT, validateAuthConfig } from "./config.js";
import { sequelize } from "./db.js";
import "./models/associations.js";
import productRoutes from "../routes/products.routes.js";
import userRoutes from "../routes/users.routes.js";
import ticketRoutes from "../routes/tickets.routes.js";
import authRoutes from "../routes/auth.routes.js";
const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use((req, res, next) => {
  const origin = req.get("origin");
  if (origin === FRONTEND_ORIGIN) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/Tickets", ticketRoutes);
app.use("/api/Productos", productRoutes);
app.use("/api/Usuarios", userRoutes);
app.use("/api/auth", authRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  if (
    error.name === "SequelizeForeignKeyConstraintError" ||
    error.parent?.code === "SQLITE_CONSTRAINT_FOREIGNKEY"
  ) {
    return res.status(409).json({
      message: "No se puede completar la operación porque hay registros relacionados.",
    });
  }
  if (error.parent?.message?.includes("Stock insuficiente")) {
    return res.status(409).json({ message: "No hay stock suficiente para completar la compra." });
  }
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({ message: "Los datos enviados no son válidos." });
  }
  res.status(500).json({ message: "Error interno del servidor." });
});

try {
  validateAuthConfig();
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
