import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { send, list, messageSchema } from "../controllers/messageController.js";

const router = Router();

router.use(protect);

router.get("/", allowRoles("teacher", "parent"), list);
router.post("/", allowRoles("teacher"), validate(messageSchema), send);

export default router;