import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  findProduct,
  findProducts,
  updateProduct,
} from "../src/services/product.service.js";
import { allowRoles, authenticateToken } from "../src/middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, findProducts);
router.get("/:id", authenticateToken, findProduct);
router.post("/", authenticateToken, allowRoles("Vendedor"), createProduct);
router.put("/:id", authenticateToken, allowRoles("Vendedor"), updateProduct);
router.delete("/:id", authenticateToken, allowRoles("Vendedor"), deleteProduct);

export default router;
