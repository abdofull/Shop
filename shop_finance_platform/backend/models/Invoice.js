
const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: "Customer",
    required: [true, "Customer is required for an invoice"],
  },
  invoiceNumber: {
    type: String,
    required: [true, "Invoice number is required"],
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
      priceAtSale: {
        type: Number,
        required: true,
        min: [0, "Price at sale cannot be negative"],
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
    enum: ["draft", "sent", "paid", "partially_paid", "overdue", "cancelled"],
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
invoiceSchema.pre("save", function (next) {
  this.subTotal = this.items.reduce((acc, item) => acc + item.quantity * item.priceAtSale, 0);
  this.totalAmount = this.subTotal + this.taxAmount;
  this.balanceDue = this.totalAmount - this.amountPaid;
  next();
});

// Index for better query performance
invoiceSchema.index({ shop: 1, customer: 1, date: -1, status: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);

