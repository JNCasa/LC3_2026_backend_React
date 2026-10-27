import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { Usuarios } from "../models/Usuario.js";
import { USER_ROLES } from "../middleware/auth.js";

const BCRYPT_ROUNDS = 12;
const MAX_PASSWORD_BYTES = 72;

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePassword(value) {
  if (typeof value !== "string" || Buffer.byteLength(value, "utf8") > MAX_PASSWORD_BYTES) {
    return "La contraseña debe tener como máximo 72 bytes.";
  }
  if (
    value.length < 8 ||
    !/[a-z]/.test(value) ||
    !/[A-Z]/.test(value) ||
    !/\d/.test(value)
  ) {
    return "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.";
  }
  return null;
}

function publicUser(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    estado: usuario.estado,
  };
}
// el token dura 1 hr
function createToken(usuario) {
  return jwt.sign(
    { rol: usuario.rol },
    JWT_SECRET,
    { subject: String(usuario.id_usuario), expiresIn: "1h" },
  );
}

function validateAccountInput(body, { allowRole = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "El cuerpo de la solicitud debe ser un objeto JSON." };
  }

  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  const email = normalizeEmail(body.email);
  if (!nombre || nombre.length > 100) {
    return { error: "El nombre es obligatorio y no puede superar los 100 caracteres." };
  }
  if (!isValidEmail(email)) {
    return { error: "Ingresá un email válido." };
  }

  const passwordError = validatePassword(body.password);
  if (passwordError) return { error: passwordError };

  const rol = allowRole ? body.rol : "Cliente";
  if (!USER_ROLES.includes(rol)) {
    return { error: "El rol indicado no es válido." };
  }

  return { usuario: { nombre, email, password: body.password, rol, estado: "Activo" } };
}

export async function register(req, res, next) {
  const input = validateAccountInput(req.body);
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

export async function login(req, res, next) {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (
    !isValidEmail(email) ||
    typeof password !== "string" ||
    !password ||
    Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES
  ) {
    return res.status(400).json({ message: "Se requiere un email y una contraseña válidos." });
  }

  try {
    const usuario = await Usuarios.unscoped().findOne({
      where: { email },
    });
    if (!usuario || usuario.estado !== "Activo") {
      return res.status(401).json({ message: "Email o contraseña incorrectos, o cuenta inactiva." });
    }

    const passwordIsHashed = /^\$2[aby]\$/.test(usuario.password);
    const validPassword = passwordIsHashed
      ? await bcrypt.compare(password, usuario.password)
      : password === usuario.password;
    if (!validPassword) {
      return res.status(401).json({ message: "Email o contraseña incorrectos, o cuenta inactiva." });
    }

    if (!passwordIsHashed) {
      await usuario.update({
        password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      });
    }

    return res.json({
      token: createToken(usuario),
      usuario: publicUser(usuario),
    });
  } catch (error) {
    return next(error);
  }
}

export function getCurrentUser(req, res) {
  return res.json({ usuario: req.user });
}

export { validateAccountInput, publicUser, BCRYPT_ROUNDS };
