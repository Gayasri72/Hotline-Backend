import { configDotenv } from "dotenv";
configDotenv();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";

// Import models to clear
import Category from "../models/product/categoryModel.js";
import Product from "../models/product/productModel.js";
import Stock from "../models/inventory/stockModel.js";
import StockAdjustment from "../models/inventory/stockAdjustmentModel.js";
import Sale from "../models/sale/saleModel.js";
import Return from "../models/sale/returnModel.js";
import Warranty from "../models/warranty/warrantyModel.js";
import RepairJob from "../models/repair/repairJobModel.js";
import Promotion from "../models/promotion/promotionModel.js";

await connectDB();

console.log("\n🧹 Clearing ALL seed data...\n");

// Clear in dependency order
await Return.deleteMany({});
console.log("✓ Cleared returns");

await Sale.deleteMany({});
console.log("✓ Cleared sales");

await Warranty.deleteMany({});
console.log("✓ Cleared warranties");

await RepairJob.deleteMany({});
console.log("✓ Cleared repair jobs");

await Promotion.deleteMany({});
console.log("✓ Cleared promotions");

await StockAdjustment.deleteMany({});
console.log("✓ Cleared stock adjustments");

await Stock.deleteMany({});
console.log("✓ Cleared stock");

await Product.deleteMany({});
console.log("✓ Cleared products");

await Category.deleteMany({});
console.log("✓ Cleared categories");

console.log("\n✅ All seed data cleared. Ready for fresh seeding.\n");

await mongoose.disconnect();
