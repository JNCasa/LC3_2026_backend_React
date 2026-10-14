import { fileURLToPath } from "node:url";
import { Sequelize } from "sequelize";

const databasePath = fileURLToPath(new URL("../dietetica.db", import.meta.url));

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: databasePath,
  logging: false,
});
