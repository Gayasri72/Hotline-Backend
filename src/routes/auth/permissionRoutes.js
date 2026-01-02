import express from "express";
import { getPermissions, getPermission } from "../../controllers/auth/permissionController.js";
import { authenticate } from "../../middlewares/auth/authenticate.js";
import { authorize } from "../../middlewares/auth/authorize.js";
import { PERMISSIONS } from "../../constants/permission.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Permission routes (read-only)
router.get("/", authorize(PERMISSIONS.MANAGE_PERMISSIONS), getPermissions);
router.get("/:id", authorize(PERMISSIONS.MANAGE_PERMISSIONS), getPermission);

export default router;
