import { Producto } from "./Producto.js";
import { Ticket } from "./Ticket.js";
import { TicketProducto } from "./TicketProducto.js";
import { Usuario } from "./Usuario.js";

Usuario.hasMany(Ticket, { foreignKey: "id_usuario", as: "tickets" });
Ticket.belongsTo(Usuario, { foreignKey: "id_usuario", as: "usuario" });

Ticket.hasMany(TicketProducto, {
  foreignKey: "id_ticket",
  as: "detalles",
});
TicketProducto.belongsTo(Ticket, { foreignKey: "id_ticket", as: "ticket" });

Producto.hasMany(TicketProducto, {
  foreignKey: "id_producto",
  as: "ventas",
});
TicketProducto.belongsTo(Producto, {
  foreignKey: "id_producto",
  as: "producto",
});
