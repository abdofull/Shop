// controllers/purchaseController.js
const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const asyncHandler = require('express-async-handler');

/**
 * @desc    إنشاء عملية شراء جديدة
 * @route   POST /api/purchases
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const createPurchase = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { supplier, items, taxAmount, notes } = req.body;

    // التحقق من وجود المورد
    const supplierExists = await Supplier.findOne({ _id: supplier, shop: shopId });
    if (!supplierExists) {
        res.status(404);
        throw new Error('المورد غير موجود');
    }

    // التحقق من المنتجات
    for (const item of items) {
        const product = await Product.findOne({ _id: item.product, shop: shopId });
        if (!product) {
            res.status(404);
            throw new Error(`المنتج ${item.product} غير موجود`);
        }
    }

    // إنشاء رقم شراء تلقائي
    const lastPurchase = await Purchase.findOne({ shop: shopId }).sort('-createdAt');
    const nextNumber = lastPurchase ? parseInt(lastPurchase.purchaseNumber.split('-')[1]) + 1 : 1;
    const purchaseNumber = `PUR-${nextNumber.toString().padStart(5, '0')}`;

    const purchase = await Purchase.create({
        shop: shopId,
        supplier,
        purchaseNumber,
        items,
        taxAmount: taxAmount || 0,
        notes,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 يوم افتراضيًا
    });

    // إنشاء معاملة مرتبطة
    await Transaction.create({
        shop: shopId,
        type: 'expense',
        category: 'purchase',
        amount: purchase.totalAmount,
        description: `شراء من المورد ${supplierExists.name}`,
        paymentMethod: 'bank_transfer',
        relatedPurchase: purchase._id
    });

    res.status(201).json(purchase);
});

/**
 * @desc    تحديث عملية شراء
 * @route   PUT /api/purchases/:id
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const updatePurchase = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;
    const { status, amountPaid } = req.body;

    const purchase = await Purchase.findOne({ _id: id, shop: shopId });
    if (!purchase) {
        res.status(404);
        throw new Error('عملية الشراء غير موجودة');
    }

    if (amountPaid !== undefined) {
        purchase.amountPaid = amountPaid;
        purchase.balanceDue = purchase.totalAmount - amountPaid;
        
        if (amountPaid >= purchase.totalAmount) {
            purchase.status = 'paid';
        } else if (amountPaid > 0) {
            purchase.status = 'partially_paid';
        }
    }

    if (status) purchase.status = status;

    const updatedPurchase = await purchase.save();
    res.json(updatedPurchase);
});

/**
 * @desc    الحصول على عمليات الشراء
 * @route   GET /api/purchases
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getPurchases = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { supplier, status, startDate, endDate } = req.query;

    let query = { shop: shopId };
    if (supplier) query.supplier = supplier;
    if (status) query.status = status;
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(query)
        .sort('-date')
        .populate('supplier', 'name phone');

    res.json(purchases);
});

/**
 * @desc    الحصول على تفاصيل عملية شراء
 * @route   GET /api/purchases/:id
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getPurchase = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;

    const purchase = await Purchase.findOne({ _id: id, shop: shopId })
        .populate('supplier', 'name email phone address')
        .populate('items.product', 'name sku price');

    if (!purchase) {
        res.status(404);
        throw new Error('عملية الشراء غير موجودة');
    }

    res.json(purchase);
});

module.exports = {
    createPurchase,
    updatePurchase,
    getPurchases,
    getPurchase
};