import express from "express";
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  assignRoles,
  assignDirectPermissions,
  getUserPermissions,
  updateMyProfile
} from "../../controllers/auth/userController.js";
import { authenticate } from "../../middlewares/auth/authenticate.js";
import { authorize } from "../../middlewares/auth/authorize.js";
import { PERMISSIONS } from "../../constants/permission.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Update own profile - must be BEFORE /:id routes to avoid conflict
// Only users with UPDATE_OWN_PROFILE permission can update their own profile
router.put("/me", authorize(PERMISSIONS.UPDATE_OWN_PROFILE), updateMyProfile);

// User CRUD
router.post("/", authorize(PERMISSIONS.CREATE_USER), createUser);
router.get("/", authorize(PERMISSIONS.VIEW_USERS), getUsers);
router.get("/:id", authorize(PERMISSIONS.VIEW_USERS), getUser);
router.put("/:id", authorize(PERMISSIONS.UPDATE_USER), updateUser);
router.delete("/:id", authorize(PERMISSIONS.DELETE_USER), deleteUser);

// Role assignment
router.put("/:id/roles", authorize(PERMISSIONS.ASSIGN_ROLES), assignRoles);

// Direct permission assignment (Admin override feature)
router.put("/:id/permissions", authorize(PERMISSIONS.ASSIGN_PERMISSIONS), assignDirectPermissions);
router.get("/:id/permissions", authorize(PERMISSIONS.VIEW_USERS), getUserPermissions);

export default router;
