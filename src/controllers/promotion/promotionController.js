import Promotion, { PROMOTION_TYPES, TARGET_TYPES } from "../../models/promotion/promotionModel.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/appError.js";

/**
 * Create a new promotion
 * POST /api/v1/promotions
 */
export const createPromotion = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    type,
    value,
    buyQuantity,
    getQuantity,
    minPurchase,
    maxDiscount,
    startDate,
    endDate,
    targetType,
    targetProducts,
    targetCategories,
    priority,
    usageLimit
  } = req.body;

  // Validate required fields
  if (!name || !type || value === undefined || !startDate || !endDate) {
    return next(new AppError("Name, type, value, startDate, and endDate are required", 400));
  }

  // Validate type
  if (!Object.values(PROMOTION_TYPES).includes(type)) {
    return next(new AppError(`Invalid promotion type. Must be: ${Object.values(PROMOTION_TYPES).join(", ")}`, 400));
  }

  // Validate dates
  if (new Date(startDate) >= new Date(endDate)) {
    return next(new AppError("End date must be after start date", 400));
  }

  // Validate BUY_X_GET_Y requirements
  if (type === PROMOTION_TYPES.BUY_X_GET_Y && (!buyQuantity || !getQuantity)) {
    return next(new AppError("buyQuantity and getQuantity are required for BUY_X_GET_Y promotions", 400));
  }

  const promotion = await Promotion.create({
    name,
    description,
    type,
    value,
    buyQuantity: type === PROMOTION_TYPES.BUY_X_GET_Y ? buyQuantity : null,
    getQuantity: type === PROMOTION_TYPES.BUY_X_GET_Y ? getQuantity : null,
    minPurchase: minPurchase || 0,
    maxDiscount: maxDiscount || null,
    startDate,
    endDate,
    targetType: targetType || TARGET_TYPES.ALL,
    targetProducts: targetProducts || [],
    targetCategories: targetCategories || [],
    priority: priority || 0,
    usageLimit: usageLimit || null,
    createdBy: req.userId
  });

  await promotion.populate("createdBy", "username");

  res.status(201).json({
    status: "success",
    data: { promotion }
  });
});

/**
 * Get all promotions
 * GET /api/v1/promotions
 */
export const getPromotions = catchAsync(async (req, res, next) => {
  const { isActive, targetType, page = 1, limit = 20 } = req.query;

  const query = {};

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (targetType) {
    query.targetType = targetType;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [promotions, total] = await Promise.all([
    Promotion.find(query)
      .populate("targetCategories", "name")
      .populate("createdBy", "username")
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Promotion.countDocuments(query)
  ]);

  res.json({
    status: "success",
    results: promotions.length,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    },
    data: { promotions }
  });
});

/**
 * Get currently active promotions
 * GET /api/v1/promotions/active
 */
export const getActivePromotions = catchAsync(async (req, res, next) => {
  const promotions = await Promotion.getActivePromotions();

  res.json({
    status: "success",
    results: promotions.length,
    data: { promotions }
  });
});

/**
 * Get single promotion
 * GET /api/v1/promotions/:id
 */
export const getPromotion = catchAsync(async (req, res, next) => {
  const promotion = await Promotion.findById(req.params.id)
    .populate("targetProducts", "name sku sellingPrice")
    .populate("targetCategories", "name")
    .populate("createdBy", "username");

  if (!promotion) {
    return next(new AppError("Promotion not found", 404));
  }

  res.json({
    status: "success",
    data: { promotion }
  });
});

/**
 * Update promotion
 * PATCH /api/v1/promotions/:id
 */
export const updatePromotion = catchAsync(async (req, res, next) => {
  const allowedFields = [
    "name", "description", "type", "value", "buyQuantity", "getQuantity",
    "minPurchase", "maxDiscount", "startDate", "endDate", "targetType",
    "targetProducts", "targetCategories", "isActive", "priority", "usageLimit"
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // Validate dates if both provided
  if (updates.startDate && updates.endDate) {
    if (new Date(updates.startDate) >= new Date(updates.endDate)) {
      return next(new AppError("End date must be after start date", 400));
    }
  }

  const promotion = await Promotion.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  )
    .populate("targetCategories", "name")
    .populate("createdBy", "username");

  if (!promotion) {
    return next(new AppError("Promotion not found", 404));
  }

  res.json({
    status: "success",
    data: { promotion }
  });
});

/**
 * Delete promotion (soft delete)
 * DELETE /api/v1/promotions/:id
 */
export const deletePromotion = catchAsync(async (req, res, next) => {
  const promotion = await Promotion.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!promotion) {
    return next(new AppError("Promotion not found", 404));
  }

  res.json({
    status: "success",
    message: "Promotion deactivated successfully"
  });
});

/**
 * Get promotions applicable to a specific product
 * GET /api/v1/promotions/for-product/:productId
 */
export const getPromotionsForProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { categoryId } = req.query;

  const promotions = await Promotion.findForProduct(productId, categoryId);

  res.json({
    status: "success",
    results: promotions.length,
    data: { promotions }
  });
});
