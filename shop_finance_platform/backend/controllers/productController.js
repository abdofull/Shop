// controllers/productController.js
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const asyncHandler = require('express-async-handler');

/**
 * @desc    إنشاء منتج جديد
 * @route   POST /api/products
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const createProduct = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { name, description, price, cost, sku, category, stockQuantity, unit } = req.body;

    const product = await Product.create({
        shop: shopId,
        name,
        description,
        price,
        cost,
        sku,
        category,
        stockQuantity,
        unit
    });

    res.status(201).json(product);
});

/**
 * @desc    تحديث منتج
 * @route   PUT /api/products/:id
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;
    const { name, description, price, cost, sku, category, stockQuantity, unit, isActive } = req.body;

    const product = await Product.findOne({ _id: id, shop: shopId });
    if (!product) {
        res.status(404);
        throw new Error('المنتج غير موجود');
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.cost = cost || product.cost;
    product.sku = sku || product.sku;
    product.category = category || product.category;
    product.stockQuantity = stockQuantity || product.stockQuantity;
    product.unit = unit || product.unit;
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    const updatedProduct = await product.save();

    res.json(updatedProduct);
});

/**
 * @desc    الحصول على جميع منتجات المتجر
 * @route   GET /api/products
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getProducts = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { category, isActive, search } = req.query;

    let query = { shop: shopId };

    // تطبيق الفلاتر
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } }
        ];
    }

    const products = await Product.find(query).sort('-createdAt');
    res.json(products);
});

/**
 * @desc    الحصول على تفاصيل منتج
 * @route   GET /api/products/:id
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;

    const product = await Product.findOne({ _id: id, shop: shopId });
    if (!product) {
        res.status(404);
        throw new Error('المنتج غير موجود');
    }

    res.json(product);
});

/**
 * @desc    تحديث كمية المخزون
 * @route   PATCH /api/products/:id/stock
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const updateStock = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;
    const { quantity, action } = req.body;

    if (!['add', 'subtract', 'set'].includes(action)) {
        res.status(400);
        throw new Error('إجراء غير صالح');
    }

    const product = await Product.findOne({ _id: id, shop: shopId });
    if (!product) {
        res.status(404);
        throw new Error('المنتج غير موجود');
    }

    switch (action) {
        case 'add':
            product.stockQuantity += quantity;
            break;
        case 'subtract':
            product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
            break;
        case 'set':
            product.stockQuantity = quantity;
            break;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
});

module.exports = {
    createProduct,
    updateProduct,
    getProducts,
    getProduct,
    updateStock
};