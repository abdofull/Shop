// controllers/customerController.js
const Customer = require('../models/Customer');
const asyncHandler = require('express-async-handler');

/**
 * @desc    إنشاء عميل جديد
 * @route   POST /api/customers
 * @access  خاص (يتطلب صلاحيات مدير/مالك/موظف)
 */
const createCustomer = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { name, email, phone, address } = req.body;

    const customer = await Customer.create({
        shop: shopId,
        name,
        email,
        phone,
        address
    });

    res.status(201).json(customer);
});

/**
 * @desc    تحديث بيانات عميل
 * @route   PUT /api/customers/:id
 * @access  خاص (يتطلب صلاحيات مدير/مالك/موظف)
 */
const updateCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;
    const { name, email, phone, address, isActive } = req.body;

    const customer = await Customer.findOne({ _id: id, shop: shopId });
    if (!customer) {
        res.status(404);
        throw new Error('العميل غير موجود');
    }

    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    customer.isActive = isActive !== undefined ? isActive : customer.isActive;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
});

/**
 * @desc    الحصول على قائمة العملاء
 * @route   GET /api/customers
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getCustomers = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { isActive, search } = req.query;

    let query = { shop: shopId };
    if (isActive !== undefined) query.isActive = isActive;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }

    const customers = await Customer.find(query).sort('-createdAt');
    res.json(customers);
});

/**
 * @desc    الحصول على تفاصيل عميل
 * @route   GET /api/customers/:id
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;

    const customer = await Customer.findOne({ _id: id, shop: shopId });
    if (!customer) {
        res.status(404);
        throw new Error('العميل غير موجود');
    }

    res.json(customer);
});

module.exports = {
    createCustomer,
    updateCustomer,
    getCustomers,
    getCustomer
};