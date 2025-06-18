
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.ObjectId,
    ref: "Shop",
    required: true,
  },
  reportType: {
    type: String,
    enum: ["profit_loss", "balance_sheet", "cash_flow", "sales_by_product", "expenses_by_category", "employee_salaries"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Flexible schema for different report data
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

// Index for better query performance
reportSchema.index({ shop: 1, reportType: 1, generatedAt: -1 });

module.exports = mongoose.model("Report", reportSchema);

