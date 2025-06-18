// controllers/reportController.js
const Report = require('../models/Report');
const asyncHandler = require('express-async-handler');
const generateSalesReport = require('../utils/reports/salesReport');
const generateProfitLossReport = require('../utils/reports/profitLossReport');
const generateExpensesReport = require('../utils/reports/expensesReport');

/**
 * @desc    إنشاء تقرير جديد
 * @route   POST /api/reports
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const createReport = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { reportType, startDate, endDate } = req.body;

    let reportData;
    switch (reportType) {
        case 'profit_loss':
            reportData = await generateProfitLossReport(shopId, startDate, endDate);
            break;
        case 'sales_by_product':
            reportData = await generateSalesReport(shopId, startDate, endDate);
            break;
        case 'expenses_by_category':
            reportData = await generateExpensesReport(shopId, startDate, endDate);
            break;
        default:
            res.status(400);
            throw new Error('نوع التقرير غير معروف');
    }

    const report = await Report.create({
        shop: shopId,
        reportType,
        startDate,
        endDate,
        data: reportData,
        generatedBy: req.user.id
    });

    res.status(201).json(report);
});

/**
 * @desc    الحصول على التقرير
 * @route   GET /api/reports/:id
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;

    const report = await Report.findOne({ _id: id, shop: shopId });
    if (!report) {
        res.status(404);
        throw new Error('التقرير غير موجود');
    }

    res.json(report);
});

/**
 * @desc    الحصول على التقارير السابقة
 * @route   GET /api/reports
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getReports = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { reportType, startDate, endDate } = req.query;

    let query = { shop: shopId };
    if (reportType) query.reportType = reportType;
    if (startDate || endDate) {
        query.generatedAt = {};
        if (startDate) query.generatedAt.$gte = new Date(startDate);
        if (endDate) query.generatedAt.$lte = new Date(endDate);
    }

    const reports = await Report.find(query)
        .sort('-generatedAt')
        .populate('generatedBy', 'name email');

    res.json(reports);
});

module.exports = {
    createReport,
    getReport,
    getReports
};