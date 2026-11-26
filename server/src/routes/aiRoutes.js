import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { improve, improveSchema } from "../controllers/aiController.js";

const router = Router();

router.post(
  "/improve-message",
  protect,
  allowRoles("teacher"),
  validate(improveSchema),
  improve
);

export default router;