import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Usuario = sequelize.define(
  "Usuario",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rol: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    estado: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "Usuario",
    timestamps: false,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
  },
);
