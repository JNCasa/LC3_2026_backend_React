import { Router } from "express";
import {
  createUser,
  findUsers,
  updateUserAccess,
} from "../src/services/user.service.js";
import { allowRoles, authenticateToken } from "../src/middleware/auth.js";

const router = Router();

router.use(authenticateToken, allowRoles("Administrador"));
router.get("/", findUsers);
router.post("/", createUser);
router.patch("/:id", updateUserAccess);

export default router;
