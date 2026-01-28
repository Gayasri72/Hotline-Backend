import express from "express";
import {
  createPromotion,
  getPromotions,
  getActivePromotions,
  getPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionsForProduct
} from "../../controllers/promotion/promotionController.js";
import { authenticate } from "../../middlewares/auth/authenticate.js";
import { authorize } from "../../middlewares/auth/authorize.js";
import { PERMISSIONS } from "../../constants/permission.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Active promotions (for POS - cashiers need this)
router.get("/active", authorize(PERMISSIONS.VIEW_PROMOTIONS), getActivePromotions);

// Promotions for specific product
router.get("/for-product/:productId", authorize(PERMISSIONS.VIEW_PROMOTIONS), getPromotionsForProduct);

// CRUD operations (admin/manager)
router.post("/", authorize(PERMISSIONS.MANAGE_PROMOTIONS), createPromotion);
router.get("/", authorize(PERMISSIONS.VIEW_PROMOTIONS), getPromotions);
router.get("/:id", authorize(PERMISSIONS.VIEW_PROMOTIONS), getPromotion);
router.patch("/:id", authorize(PERMISSIONS.MANAGE_PROMOTIONS), updatePromotion);
router.delete("/:id", authorize(PERMISSIONS.MANAGE_PROMOTIONS), deletePromotion);

export default router;
