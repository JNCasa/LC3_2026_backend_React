import { Router } from "express";
import {
  createTicket,
  findTicket,
  findTickets,
  updateTicket,
} from "../src/services/ticket.service.js";
import { allowRoles, authenticateToken } from "../src/middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, findTickets);
router.get("/:id", authenticateToken, findTicket);
router.post("/", authenticateToken, allowRoles("Cliente"), createTicket);
router.put("/:id", authenticateToken, allowRoles("Administrador"), updateTicket);

export default router;