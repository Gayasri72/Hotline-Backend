import express from "express";
import {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole
} from "../../controllers/auth/roleController.js";
import { authenticate } from "../../middlewares/auth/authenticate.js";
import { authorize } from "../../middlewares/auth/authorize.js";
import { PERMISSIONS } from "../../constants/permission.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Role CRUD
router.post("/", authorize(PERMISSIONS.MANAGE_ROLES), createRole);
router.get("/", authorize(PERMISSIONS.MANAGE_ROLES), getRoles);
router.get("/:id", authorize(PERMISSIONS.MANAGE_ROLES), getRole);
router.put("/:id", authorize(PERMISSIONS.MANAGE_ROLES), updateRole);
router.delete("/:id", authorize(PERMISSIONS.MANAGE_ROLES), deleteRole);

// Assign permissions to role
router.put("/:id/permissions", authorize(PERMISSIONS.MANAGE_ROLES), assignPermissionsToRole);

export default router;
