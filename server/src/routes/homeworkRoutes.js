import { Router } from "express";
import { protect, allowRoles } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  create,
  list,
  updateStatus,
  remove,
  homeworkSchema,
  statusSchema,
} from "../controllers/homeworkController.js";

const router = Router();

router.use(protect);

router.get("/", allowRoles("teacher", "student"), list);
router.post("/", allowRoles("teacher"), validate(homeworkSchema), create);
router.patch(
  "/:id/status",
  allowRoles("student"),
  validate(statusSchema),
  updateStatus
);
router.delete("/:id", allowRoles("teacher"), remove);

export default router;