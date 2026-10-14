import { Usuario } from "../models/Usuario.js";

export async function findUsers(_req, res, next) {
  try {
    const users = await Usuario.findAll({
      attributes: ["id_usuario", "nombre", "email", "rol", "estado"],
      order: [["id_usuario", "ASC"]],
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
}
// src/services/user.service.js: obtiene usuarios 
// desde Sequelize y devuelve solo algunos campos
//  (sin contraseña), listo para una API REST.