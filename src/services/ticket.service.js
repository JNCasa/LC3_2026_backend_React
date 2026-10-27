import { Tickets } from "../models/Ticket.js";
import { DetallesTicket } from "../models/DetalleTicket.js";
import { Usuarios } from "../models/Usuario.js";
import { Productos } from "../models/Producto.js";
import { sequelize } from "../db.js";
import { Transaction } from "sequelize";

const ticketIncludes = [
  {
    model: Usuarios,
    as: "usuario",
    attributes: ["id_usuario", "nombre", "email"],
  },
  {
    model: DetallesTicket,
    as: "productos",
    attributes: ["id_producto", "cantidad", "importe"],
    include: [
      {
        model: Productos,
        as: "producto",
        attributes: ["id_producto", "nombre_producto", "precio"],
      },
    ],
  },
];

function validatePurchaseInput(body) {
  const { id_usuario, productos } = body ?? {};
  if (
    !Number.isSafeInteger(id_usuario) ||
    id_usuario < 1 ||
    !Array.isArray(productos) ||
    productos.length === 0
  ) {
    return {
      error: "Se requiere un id_usuario válido y al menos un producto.",
    };
  }

  const productQuantities = new Map();
  for (const item of productos) {
    if (
      !item ||
      !Number.isSafeInteger(item.id_producto) ||
      item.id_producto < 1 ||
      !Number.isSafeInteger(item.cantidad) ||
      item.cantidad < 1
    ) {
      return {
        error:
          "Cada producto debe tener un id_producto y una cantidad entera positiva.",
      };
    }

    const cantidad = (productQuantities.get(item.id_producto) ?? 0) + item.cantidad;
    if (!Number.isSafeInteger(cantidad)) {
      return { error: "La cantidad total de un producto es demasiado grande." };
    }
    productQuantities.set(item.id_producto, cantidad);
  }

  return { id_usuario, productQuantities };
}

function calculateTicketLines(productQuantities, productsById) {
  const ticketLines = [...productQuantities].map(([id_producto, cantidad]) => {
    const precio = Number(productsById.get(id_producto).precio);
    const importe = Number((precio * cantidad).toFixed(2));
    return { id_producto, cantidad, importe };
  });
  const monto_total = Number(
    (
      ticketLines.reduce((total, line) => total + Math.round(line.importe * 100), 0) /
      100
    ).toFixed(2),
  );

  return { ticketLines, monto_total };
}

function parseTicketId(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export async function findTickets(req, res, next) {
  try {
    const tickets = await Tickets.findAll({
      ...(req.user.rol === "Cliente"
        ? { where: { id_usuario: req.user.id_usuario } }
        : {}),
      include: ticketIncludes,
      order: [["id_ticket", "ASC"]],
    });

    res.json(tickets);
  } catch (error) {
    next(error);
  }
}

export async function findTicket(req, res, next) {
  const id_ticket = parseTicketId(req.params.id);
  if (!id_ticket) {
    return res.status(400).json({ message: "El id_ticket debe ser un entero positivo." });
  }

  try {
    const ticket = await Tickets.findByPk(id_ticket, { include: ticketIncludes });
    if (!ticket) {
      return res.status(404).json({ message: "No se encontró el ticket solicitado." });
    }
    if (
      req.user.rol === "Cliente" &&
      ticket.id_usuario !== req.user.id_usuario
    ) {
      return res.status(404).json({ message: "No se encontró el ticket solicitado." });
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
}

export async function createTicket(req, res, next) {
  const input = validatePurchaseInput({
    id_usuario: req.user.id_usuario,
    productos: req.body?.productos,
  });
  if (input.error) {
    return res.status(400).json({ message: input.error });
  }
  const { id_usuario, productQuantities } = input;

  try {
    const transaction = await sequelize.transaction({
      type: Transaction.TYPES.IMMEDIATE,
    });
    try {
      const user = await Usuarios.findByPk(id_usuario, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(400).json({ message: "El usuario indicado no existe." });
      }

      const products = await Productos.findAll({
        where: { id_producto: [...productQuantities.keys()] },
        attributes: ["id_producto", "precio"],
        transaction,
      });
      const productsById = new Map(products.map((product) => [product.id_producto, product]));

      if (productsById.size !== productQuantities.size) {
        await transaction.rollback();
        return res.status(400).json({
          message: "Uno o más productos no existen.",
        });
      }

      const { ticketLines, monto_total } = calculateTicketLines(
        productQuantities,
        productsById,
      );
      const ticket = await Tickets.create(
        { id_usuario, fecha: new Date(), monto_total },
        { transaction },
      );

      for (const line of ticketLines) {
        await DetallesTicket.create(
          { id_ticket: ticket.id_ticket, ...line },
          { transaction },
        );
      }

      const createdTicket = await Tickets.findByPk(ticket.id_ticket, {
        include: ticketIncludes,
        transaction,
      });

      await transaction.commit();
      res.status(201).json(createdTicket);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(req, res, next) {
  const id_ticket = parseTicketId(req.params.id);
  if (!id_ticket) {
    return res.status(400).json({ message: "El id_ticket debe ser un entero positivo." });
  }

  const input = validatePurchaseInput(req.body);
  if (input.error) {
    return res.status(400).json({ message: input.error });
  }
  const { id_usuario, productQuantities } = input;

  try {
    const transaction = await sequelize.transaction({
      type: Transaction.TYPES.IMMEDIATE,
    });
    try {
      const ticket = await Tickets.findByPk(id_ticket, { transaction });
      if (!ticket) {
        await transaction.rollback();
        return res.status(404).json({ message: "No se encontró el ticket solicitado." });
      }

      const user = await Usuarios.findByPk(id_usuario, { transaction });
      if (!user) {
        await transaction.rollback();
        return res.status(400).json({ message: "El usuario indicado no existe." });
      }

      const products = await Productos.findAll({
        where: { id_producto: [...productQuantities.keys()] },
        attributes: ["id_producto", "precio"],
        transaction,
      });
      const productsById = new Map(products.map((product) => [product.id_producto, product]));
      if (productsById.size !== productQuantities.size) {
        await transaction.rollback();
        return res.status(400).json({ message: "Uno o más productos no existen." });
      }

      const existingLines = await DetallesTicket.findAll({
        where: { id_ticket },
        attributes: ["id_producto", "cantidad"],
        transaction,
      });
      for (const line of existingLines) {
        await Productos.increment("stock", {
          by: line.cantidad,
          where: { id_producto: line.id_producto },
          transaction,
        });
      }
      await DetallesTicket.destroy({ where: { id_ticket }, transaction });

      const { ticketLines, monto_total } = calculateTicketLines(
        productQuantities,
        productsById,
      );
      await ticket.update({ id_usuario, monto_total }, { transaction });
      for (const line of ticketLines) {
        await DetallesTicket.create({ id_ticket, ...line }, { transaction });
      }

      const updatedTicket = await Tickets.findByPk(id_ticket, {
        include: ticketIncludes,
        transaction,
      });
      await transaction.commit();
      res.json(updatedTicket);
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
}