// controllers/shopController.js
const Shop = require('../models/Shop');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

/**
 * @desc    إنشاء متجر جديد
 * @route   POST /api/shops
 * @access  خاص (يتطلب تسجيل دخول)
 */
const createShop = asyncHandler(async (req, res) => {
    const { name, description, address, phone, email, website, businessType } = req.body;
    const ownerId = req.user.id;

    // التحقق من أن المستخدم ليس لديه متجر بالفعل
    const existingShop = await Shop.findOne({ owner: ownerId });
    if (existingShop) {
        res.status(400);
        throw new Error('لديك متجر بالفعل');
    }

    const shop = await Shop.create({
        name,
        owner: ownerId,
        description,
        address,
        phone,
        email,
        website,
        businessType
    });

    // تحديث دور المستخدم إلى owner
    await User.findByIdAndUpdate(ownerId, { role: 'owner' });

    res.status(201).json(shop);
});

/**
 * @desc    تحديث بيانات المتجر
 * @route   PUT /api/shops/:id
 * @access  خاص (يتطلب صلاحيات مالك المتجر)
 */
const updateShop = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, address, phone, email, website, businessType } = req.body;

    const shop = await Shop.findById(id);
    if (!shop) {
        res.status(404);
        throw new Error('المتجر غير موجود');
    }

    // التحقق من أن المستخدم هو مالك المتجر
    if (shop.owner.toString() !== req.user.id) {
        res.status(403);
        throw new Error('غير مصرح لك بتحديث هذا المتجر');
    }

    shop.name = name || shop.name;
    shop.description = description || shop.description;
    shop.address = address || shop.address;
    shop.phone = phone || shop.phone;
    shop.email = email || shop.email;
    shop.website = website || shop.website;
    shop.businessType = businessType || shop.businessType;

    const updatedShop = await shop.save();

    res.json(updatedShop);
});

/**
 * @desc    الحصول على بيانات المتجر
 * @route   GET /api/shops/:id
 * @access  خاص (يتطلب صلاحيات الوصول للمتجر)
 */
const getShop = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const shop = await Shop.findById(id);
    if (!shop) {
        res.status(404);
        throw new Error('المتجر غير موجود');
    }

    // التحقق من أن المستخدم لديه صلاحيات الوصول للمتجر
    const user = await User.findById(req.user.id);
    if (shop.owner.toString() !== req.user.id && user.role !== 'manager') {
        res.status(403);
        throw new Error('غير مصرح لك بالوصول إلى هذا المتجر');
    }

    res.json(shop);
});

module.exports = {
    createShop,
    updateShop,
    getShop
};