import { Router } from "express";
import {
  createUser,
  deleteUser,
  findUsers,
  updateUserAccess,
} from "../src/services/user.service.js";
import { allowRoles, authenticateToken } from "../src/middleware/auth.js";

const router = Router();

router.use(authenticateToken, allowRoles("Administrador"));
router.get("/", findUsers);
router.post("/", createUser);
router.patch("/:id", updateUserAccess);
router.delete("/:id", deleteUser);

export default router;
