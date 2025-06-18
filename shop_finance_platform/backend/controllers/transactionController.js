// controllers/transactionController.js
const Transaction = require('../models/Transaction');
const Shop = require('../models/Shop');
const asyncHandler = require('express-async-handler');

/**
 * @desc    إنشاء معاملة جديدة
 * @route   POST /api/transactions
 * @access  خاص (يتطلب تسجيل دخول)
 */
const createTransaction = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { type, category, amount, description, paymentMethod, relatedInvoice, relatedPurchase, relatedEmployee } = req.body;

    // التحقق من أن المتجر موجود
    const shop = await Shop.findById(shopId);
    if (!shop) {
        res.status(404);
        throw new Error('المتجر غير موجود');
    }

    // إنشاء المعاملة
    const transaction = await Transaction.create({
        shop: shopId,
        type,
        category,
        amount,
        description,
        paymentMethod,
        relatedInvoice,
        relatedPurchase,
        relatedEmployee
    });

    res.status(201).json(transaction);
});

/**
 * @desc    الحصول على جميع معاملات المتجر
 * @route   GET /api/transactions
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getTransactions = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { type, startDate, endDate, category } = req.query;

    let query = { shop: shopId };

    // تطبيق الفلاتر
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
        .sort('-date')
        .populate('relatedInvoice', 'invoiceNumber')
        .populate('relatedEmployee', 'name');

    res.json(transactions);
});

/**
 * @desc    الحصول على إحصائيات المعاملات
 * @route   GET /api/transactions/stats
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getTransactionStats = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { startDate, endDate } = req.query;

    let matchQuery = { shop: shopId };

    // تطبيق نطاق التاريخ إذا تم توفيره
    if (startDate || endDate) {
        matchQuery.date = {};
        if (startDate) matchQuery.date.$gte = new Date(startDate);
        if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$type',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: null,
                income: {
                    $sum: {
                        $cond: [{ $eq: ['$_id', 'income'] }, '$totalAmount', 0]
                    }
                },
                expense: {
                    $sum: {
                        $cond: [{ $eq: ['$_id', 'expense'] }, '$totalAmount', 0]
                    }
                },
                totalTransactions: { $sum: '$count' }
            }
        },
        {
            $project: {
                _id: 0,
                income: 1,
                expense: 1,
                balance: { $subtract: ['$income', '$expense'] },
                totalTransactions: 1
            }
        }
    ]);

    res.json(stats[0] || { income: 0, expense: 0, balance: 0, totalTransactions: 0 });
});

module.exports = {
    createTransaction,
    getTransactions,
    getTransactionStats
};