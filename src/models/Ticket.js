import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Tickets = sequelize.define(
  "Tickets",
  {
    id_ticket: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    monto_total: {
      type: DataTypes.REAL,
      allowNull: false,
      validate: { min: Number.MIN_VALUE },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Tickets",
    timestamps: false,
  },
);
