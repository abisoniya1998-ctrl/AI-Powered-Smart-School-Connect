import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { protect, allowRoles } from "../middleware/auth.js";
import {
  register,
  login,
  me,
  linkChild,
  registerSchema,
  loginSchema,
  linkChildSchema,
} from "../controllers/authController.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, me);
router.post(
  "/link-child",
  protect,
  allowRoles("parent"),
  validate(linkChildSchema),
  linkChild
);

export default router;