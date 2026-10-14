import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const TicketProducto = sequelize.define(
  "TicketProducto",
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
  },
  {
    tableName: "Ticket_Producto",
    timestamps: false,
  },
);
