// controllers/invoiceController.js
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const asyncHandler = require('express-async-handler');

/**
 * @desc    إنشاء فاتورة جديدة
 * @route   POST /api/invoices
 * @access  خاص (يتطلب صلاحيات مدير/مالك/موظف)
 */
const createInvoice = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { customer, items, taxAmount, notes } = req.body;

    // التحقق من وجود العميل
    const customerExists = await Customer.findOne({ _id: customer, shop: shopId });
    if (!customerExists) {
        res.status(404);
        throw new Error('العميل غير موجود');
    }

    // التحقق من المنتجات والمخزون
    for (const item of items) {
        const product = await Product.findOne({ _id: item.product, shop: shopId });
        if (!product) {
            res.status(404);
            throw new Error(`المنتج ${item.product} غير موجود`);
        }
        if (product.stockQuantity < item.quantity) {
            res.status(400);
            throw new Error(`لا يوجد مخزون كافي للمنتج ${product.name}`);
        }
    }

    // إنشاء رقم فاتورة تلقائي
    const lastInvoice = await Invoice.findOne({ shop: shopId }).sort('-createdAt');
    const nextNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1 : 1;
    const invoiceNumber = `INV-${nextNumber.toString().padStart(5, '0')}`;

    const invoice = await Invoice.create({
        shop: shopId,
        customer,
        invoiceNumber,
        items,
        taxAmount: taxAmount || 0,
        notes,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 يوم افتراضيًا
    });

    // تحديث مخزون المنتجات
    for (const item of items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: -item.quantity }
        });
    }

    // إنشاء معاملة مرتبطة
    await Transaction.create({
        shop: shopId,
        type: 'income',
        category: 'sale',
        amount: invoice.totalAmount,
        description: `فاتورة مبيعات للعميل ${customerExists.name}`,
        paymentMethod: 'cash',
        relatedInvoice: invoice._id,
        relatedEmployee: req.user.id
    });

    res.status(201).json(invoice);
});

/**
 * @desc    تحديث فاتورة
 * @route   PUT /api/invoices/:id
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const updateInvoice = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;
    const { status, amountPaid } = req.body;

    const invoice = await Invoice.findOne({ _id: id, shop: shopId });
    if (!invoice) {
        res.status(404);
        throw new Error('الفاتورة غير موجودة');
    }

    if (amountPaid !== undefined) {
        invoice.amountPaid = amountPaid;
        invoice.balanceDue = invoice.totalAmount - amountPaid;
        
        if (amountPaid >= invoice.totalAmount) {
            invoice.status = 'paid';
        } else if (amountPaid > 0) {
            invoice.status = 'partially_paid';
        }
    }

    if (status) invoice.status = status;

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
});

/**
 * @desc    الحصول على الفواتير
 * @route   GET /api/invoices
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getInvoices = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { customer, status, startDate, endDate } = req.query;

    let query = { shop: shopId };
    if (customer) query.customer = customer;
    if (status) query.status = status;
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
        .sort('-date')
        .populate('customer', 'name phone');

    res.json(invoices);
});

/**
 * @desc    الحصول على تفاصيل فاتورة
 * @route   GET /api/invoices/:id
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getInvoice = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;

    const invoice = await Invoice.findOne({ _id: id, shop: shopId })
        .populate('customer', 'name email phone address')
        .populate('items.product', 'name sku price');

    if (!invoice) {
        res.status(404);
        throw new Error('الفاتورة غير موجودة');
    }

    res.json(invoice);
});

module.exports = {
    createInvoice,
    updateInvoice,
    getInvoices,
    getInvoice
};