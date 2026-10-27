import { Router } from "express";
import { authenticateToken } from "../src/middleware/auth.js";
import {
  getCurrentUser,
  login,
  register,
} from "../src/services/auth.service.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);

export default router;

// router.post("/register", register);
// POST /api/auth/register crea una cuenta. 
// Express ejecuta la función register cuando 
// recibe una petición a esa dirección. No exige token.

// router.post("/login", login);
// POST /api/auth/login inicia sesión. 
// La función login valida el email y la contraseña y, 
// si son correctos, devuelve un token. Tampoco exige token.

// router.get("/me", authenticateToken, getCurrentUser);
// GET /api/auth/me devuelve los datos del usuario autenticado.
//  Primero ejecuta authenticateToken, 
//  que revisa el token enviado en el encabezado 
//  Authorization: Bearer <token>. Si es válido, continúa con getCurrentUser;
//   si no, responde con un error y no llega a esa función.
