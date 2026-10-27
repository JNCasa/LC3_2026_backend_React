import { Productos } from "./Producto.js";
import { Tickets } from "./Ticket.js";
import { DetallesTicket } from "./DetalleTicket.js";
import { Usuarios } from "./Usuario.js";

Usuarios.hasMany(Tickets, { foreignKey: "id_usuario", as: "tickets" });
Tickets.belongsTo(Usuarios, { foreignKey: "id_usuario", as: "usuario" });
Tickets.hasMany(DetallesTicket, {
  foreignKey: "id_ticket",
  as: "productos",
});
DetallesTicket.belongsTo(Tickets, {
  foreignKey: "id_ticket",
  as: "ticket",
});
Productos.hasMany(DetallesTicket, {
  foreignKey: "id_producto",
  as: "detalles_ticket",
});
DetallesTicket.belongsTo(Productos, {
  foreignKey: "id_producto",
  as: "producto",
});
