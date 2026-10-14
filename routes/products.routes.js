import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  findProduct,
  findProducts,
  updateProduct,
} from "../src/services/product.service.js";

const router = Router();

router.get("/", findProducts);
router.get("/:id", findProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
