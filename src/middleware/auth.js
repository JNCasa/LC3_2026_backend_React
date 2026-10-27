import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { Usuarios } from "../models/Usuario.js";

export const USER_ROLES = ["Administrador", "Vendedor", "Cliente"];
export const USER_STATES = ["Activo", "Pendiente", "Inactivo"];

export async function authenticateToken(req, res, next) {
  const authorization = req.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({ message: "Se requiere un token Bearer válido." });
  }

  let payload;
  try {
    payload = jwt.verify(match[1], JWT_SECRET);
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({ message: "El token es inválido o expiró." });
    }
    return next(error);
  }

  if (
    typeof payload !== "object" ||
    typeof payload.sub !== "string" ||
    !/^[1-9]\d*$/.test(payload.sub) ||
    !USER_ROLES.includes(payload.rol)
  ) {
    return res.status(401).json({ message: "El token no contiene un usuario válido." });
  }

  try {
    const usuario = await Usuarios.findByPk(Number(payload.sub));
    if (!usuario || usuario.estado !== "Activo" || usuario.rol !== payload.rol) {
      return res.status(401).json({
        message: "La cuenta ya no está activa o sus permisos cambiaron.",
      });
    }

    req.user = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Se requiere autenticación." });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: "No tenés permiso para realizar esta operación." });
    }
    return next();
  };
}
