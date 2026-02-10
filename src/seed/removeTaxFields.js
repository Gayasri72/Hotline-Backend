import { configDotenv } from "dotenv";
configDotenv();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";

await connectDB();

console.log("\n🧹 Cleaning tax fields from database...\n");

const db = mongoose.connection.db;

// 1. Remove taxRate from all products
const productResult = await db.collection("products").updateMany(
  {},
  { $unset: { taxRate: "" } }
);
console.log(`✓ Products: Removed taxRate from ${productResult.modifiedCount} documents`);

// 2. Remove taxRate and taxAmount from sale items, and taxTotal from sales
const saleResult = await db.collection("sales").updateMany(
  {},
  {
    $unset: { taxTotal: "" },
    $set: {
      "items.$[].taxRate": undefined,
      "items.$[].taxAmount": undefined
    }
  }
);
// Use a separate update for nested array fields since $unset on positional doesn't work well
const saleItemsResult = await db.collection("sales").updateMany(
  {},
  {
    $unset: {
      "items.$[].taxRate": "",
      "items.$[].taxAmount": ""
    }
  }
);
console.log(`✓ Sales: Removed taxTotal from ${saleResult.modifiedCount} documents`);
console.log(`✓ Sale Items: Cleaned taxRate/taxAmount from ${saleItemsResult.modifiedCount} documents`);

// Verify cleanup
const sampleProduct = await db.collection("products").findOne({});
const sampleSale = await db.collection("sales").findOne({});

console.log("\n--- Verification ---");
if (sampleProduct) {
  console.log(`Product fields: ${Object.keys(sampleProduct).join(", ")}`);
  console.log(`  taxRate present: ${"taxRate" in sampleProduct}`);
}
if (sampleSale) {
  console.log(`Sale fields: ${Object.keys(sampleSale).join(", ")}`);
  console.log(`  taxTotal present: ${"taxTotal" in sampleSale}`);
  if (sampleSale.items && sampleSale.items[0]) {
    console.log(`  Sale item fields: ${Object.keys(sampleSale.items[0]).join(", ")}`);
    console.log(`  item taxRate present: ${"taxRate" in sampleSale.items[0]}`);
  }
}

console.log("\n✅ Tax fields cleanup complete!");

await mongoose.disconnect();
console.log("🔌 DB disconnected\n");
