import { Router } from "express";
import { findUsers } from "../src/services/user.service.js";

const router = Router();

router.get("/", findUsers);

export default router;
