import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const DetallesTicket = sequelize.define(
  "DetallesTicket",
  {
    id_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_ticket: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nombre_producto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    precio_unitario: {
      type: DataTypes.REAL,
      allowNull: false,
      validate: { min: 0 },
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
