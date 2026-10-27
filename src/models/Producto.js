import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Productos = sequelize.define(
  "Productos",
  {
    id_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    nombre_producto: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imagen: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    precio: {
      type: DataTypes.REAL,
      allowNull: false,
      validate: { min: Number.MIN_VALUE },
    },
    peso: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "Productos",
    timestamps: false,
  },
);
