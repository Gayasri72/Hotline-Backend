import express from "express";
import {
  createReturn,
  createExchange,
  getReturns,
  getReturn
} from "../../controllers/sale/returnController.js";
import { authenticate } from "../../middlewares/auth/authenticate.js";
import { authorize } from "../../middlewares/auth/authorize.js";
import { PERMISSIONS } from "../../constants/permission.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Return routes
router.post("/", authorize(PERMISSIONS.CREATE_RETURN), createReturn);
router.post("/exchange", authorize(PERMISSIONS.CREATE_RETURN), createExchange);
router.get("/", authorize(PERMISSIONS.VIEW_RETURNS), getReturns);
router.get("/:id", authorize(PERMISSIONS.VIEW_RETURNS), getReturn);

export default router;
