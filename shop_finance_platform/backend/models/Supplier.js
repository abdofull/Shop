
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Supplier name is required"],
    trim: true,
    maxlength: [100, "Supplier name cannot be more than 100 characters"],
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
  contactPerson: {
    type: String,
    trim: true,
  },
  paymentTerms: {
    type: String,
    enum: ["net 7", "net 15", "net 30", "net 60", "due on receipt"],
    default: "net 30",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
supplierSchema.index({ shop: 1, isActive: 1 });

module.exports = mongoose.model("Supplier", supplierSchema);

