const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxlength: [100, "Product name cannot be more than 100 characters"],
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  cost: {
    type: Number,
    min: [0, "Cost cannot be negative"],
  },
  sku: {
    type: String,
    trim: true,
    unique: true, // SKU should be unique per shop, but for simplicity, unique globally for now
  },
  category: {
    type: String,
    trim: true,
  },
  stockQuantity: {
    type: Number,
    required: [true, "Stock quantity is required"],
    min: [0, "Stock quantity cannot be negative"],
    default: 0,
  },
  unit: {
    type: String,
    default: "piece",
  },
  imageUrl: {
    type: String,
    default: "no-photo.jpg",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
productSchema.index({ shop: 1, category: 1, isActive: 1 });

module.exports = mongoose.model("Product", productSchema);

