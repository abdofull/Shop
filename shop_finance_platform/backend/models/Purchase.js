
const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  supplier: {
    type: mongoose.Schema.ObjectId,
    ref: "Supplier",
    required: [true, "Supplier is required for a purchase"],
  },
  purchaseNumber: {
    type: String,
    required: [true, "Purchase number is required"],
    unique: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
      },
      costAtPurchase: {
        type: Number,
        required: true,
        min: [0, "Cost at purchase cannot be negative"],
      },
    },
  ],
  subTotal: {
    type: Number,
    required: true,
    min: [0, "Subtotal cannot be negative"],
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, "Tax amount cannot be negative"],
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, "Total amount cannot be negative"],
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, "Amount paid cannot be negative"],
  },
  balanceDue: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["draft", "ordered", "received", "paid", "partially_paid", "overdue", "cancelled"],
    default: "draft",
  },
  notes: {
    type: String,
    maxlength: [500, "Notes cannot be more than 500 characters"],
  },
}, {
  timestamps: true,
});

// Calculate total amount before saving
purchaseSchema.pre("save", function (next) {
  this.subTotal = this.items.reduce((acc, item) => acc + item.quantity * item.costAtPurchase, 0);
  this.totalAmount = this.subTotal + this.taxAmount;
  this.balanceDue = this.totalAmount - this.amountPaid;
  next();
});

// Index for better query performance
purchaseSchema.index({ shop: 1, supplier: 1, date: -1, status: 1 });

module.exports = mongoose.model("Purchase", purchaseSchema);

