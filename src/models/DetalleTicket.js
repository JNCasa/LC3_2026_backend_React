import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const DetallesTicket = sequelize.define(
  "DetallesTicket",
  {
    id_ticket: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    importe: {
      type: DataTypes.REAL,
      allowNull: false,
      validate: { min: Number.MIN_VALUE },
    },
  },
  {
    tableName: "Tickets_Productos",
    timestamps: false,
  },
);
