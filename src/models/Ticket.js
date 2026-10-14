import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Ticket = sequelize.define(
  "Ticket",
  {
    id_ticket: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Ticket",
    timestamps: false,
  },
);
