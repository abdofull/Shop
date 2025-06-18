// controllers/supplierController.js
const Supplier = require('../models/Supplier');
const Shop = require('../models/Shop');
const asyncHandler = require('express-async-handler');

/**
 * @desc    إنشاء مورد جديد
 * @route   POST /api/suppliers
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const createSupplier = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { name, email, phone, address, contactPerson, paymentTerms } = req.body;

    const supplier = await Supplier.create({
        shop: shopId,
        name,
        email,
        phone,
        address,
        contactPerson,
        paymentTerms
    });

    res.status(201).json(supplier);
});

/**
 * @desc    تحديث بيانات مورد
 * @route   PUT /api/suppliers/:id
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const updateSupplier = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;
    const { name, email, phone, address, contactPerson, paymentTerms, isActive } = req.body;

    const supplier = await Supplier.findOne({ _id: id, shop: shopId });
    if (!supplier) {
        res.status(404);
        throw new Error('المورد غير موجود');
    }

    supplier.name = name || supplier.name;
    supplier.email = email || supplier.email;
    supplier.phone = phone || supplier.phone;
    supplier.address = address || supplier.address;
    supplier.contactPerson = contactPerson || supplier.contactPerson;
    supplier.paymentTerms = paymentTerms || supplier.paymentTerms;
    supplier.isActive = isActive !== undefined ? isActive : supplier.isActive;

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
});

/**
 * @desc    الحصول على قائمة الموردين
 * @route   GET /api/suppliers
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getSuppliers = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { isActive } = req.query;

    let query = { shop: shopId };
    if (isActive !== undefined) query.isActive = isActive;

    const suppliers = await Supplier.find(query).sort('-createdAt');
    res.json(suppliers);
});

/**
 * @desc    الحصول على تفاصيل مورد
 * @route   GET /api/suppliers/:id
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getSupplier = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;

    const supplier = await Supplier.findOne({ _id: id, shop: shopId });
    if (!supplier) {
        res.status(404);
        throw new Error('المورد غير موجود');
    }

    res.json(supplier);
});

module.exports = {
    createSupplier,
    updateSupplier,
    getSuppliers,
    getSupplier
};