
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: [true, "Transaction type is required"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0, "Amount cannot be negative"],
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  relatedInvoice: {
    type: mongoose.Schema.ObjectId,
    ref: "Invoice",
  },
  relatedPurchase: {
    type: mongoose.Schema.ObjectId,
    ref: "Purchase",
  },
  relatedEmployee: {
    type: mongoose.Schema.ObjectId,
    ref: "Employee",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "bank_transfer", "card", "cheque", "other"],
    default: "cash",
  },
}, {
  timestamps: true,
});

// Index for better query performance
transactionSchema.index({ shop: 1, type: 1, date: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);

