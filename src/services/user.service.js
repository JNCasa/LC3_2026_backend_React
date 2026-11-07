import bcrypt from "bcrypt";
import { validateAccountInput, publicUser, BCRYPT_ROUNDS } from "./auth.service.js";
import { Usuarios } from "../models/Usuario.js";
import { USER_ROLES, USER_STATES } from "../middleware/auth.js";

const parseUserId = (value) => {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

export async function findUsers(_req, res, next) {
  try {
    const users = await Usuarios.findAll({
      attributes: ["id_usuario", "nombre", "email", "rol", "estado"],
      order: [["id_usuario", "ASC"]],
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  const input = validateAccountInput(req.body, { allowRole: true });
  if (input.error) {
    return res.status(400).json({ message: input.error });
  }

  try {
    const existing = await Usuarios.unscoped().findOne({
      where: { email: input.usuario.email },
      attributes: ["id_usuario"],
    });
    if (existing) {
      return res.status(409).json({ message: "Ya existe una cuenta con ese email." });
    }

    const usuario = await Usuarios.create({
      ...input.usuario,
      password: await bcrypt.hash(input.usuario.password, BCRYPT_ROUNDS),
    });
    return res.status(201).json({ usuario: publicUser(usuario) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  const id_usuario = parseUserId(req.params.id);
  if (!id_usuario) {
    return res.status(400).json({ message: "El id_usuario debe ser un entero positivo." });
  }

  try {
    const usuario = await Usuarios.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: "No se encontró el usuario solicitado." });
    }

    if (usuario.id_usuario === req.user.id_usuario) {
      return res.status(409).json({ message: "No podés eliminar tu propia cuenta." });
    }

    await usuario.destroy();
    return res.status(204).send();
  } catch (error) {
    if (
      error.name === "SequelizeForeignKeyConstraintError" ||
      error.parent?.code === "SQLITE_CONSTRAINT_FOREIGNKEY"
    ) {
      return res.status(409).json({
        message: "No se puede eliminar el usuario porque tiene registros relacionados.",
      });
    }
    return next(error);
  }
}

export async function updateUserAccess(req, res, next) {
  const id_usuario = parseUserId(req.params.id);
  if (!id_usuario) {
    return res.status(400).json({ message: "El id_usuario debe ser un entero positivo." });
  }

  const { rol, estado } = req.body ?? {};
  if (
    (rol === undefined && estado === undefined) ||
    (rol !== undefined && !USER_ROLES.includes(rol)) ||
    (estado !== undefined && !USER_STATES.includes(estado))
  ) {
    return res.status(400).json({
      message: "Enviá un rol válido, un estado válido, o ambos.",
    });
  }

  try {
    const usuario = await Usuarios.findByPk(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: "No se encontró el usuario solicitado." });
    }

    await usuario.update({
      ...(rol === undefined ? {} : { rol }),
      ...(estado === undefined ? {} : { estado }),
    });
    return res.json({ usuario: publicUser(usuario) });
  } catch (error) {
    return next(error);
  }
}