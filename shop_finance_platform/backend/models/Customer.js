
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Customer name is required"],
    trim: true,
    maxlength: [100, "Customer name cannot be more than 100 characters"],
  },
  email: {
    type: String,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: "Libya",
    },
    zipCode: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
customerSchema.index({ shop: 1, isActive: 1 });

module.exports = mongoose.model("Customer", customerSchema);

