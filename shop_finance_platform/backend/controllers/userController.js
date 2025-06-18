// controllers/userController.js
const User = require('../models/User');
const Shop = require('../models/Shop');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// دالة مساعدة لتوليد التوكن
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // صلاحية التوكن 30 يوم
    });
};

/**
 * @desc    تسجيل مستخدم جديد مع إنشاء متجر للمالكين
 * @route   POST /api/users/register
 * @access  عام
 */
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role, shopName } = req.body;

    // التحقق من وجود المستخدم مسبقاً
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            error: 'البريد الإلكتروني مسجل مسبقاً'
        });
    }

    // إنشاء متجر جديد إذا كان المستخدم مالكاً
    let shop = null;
    if (role === 'owner') {
        if (!shopName) {
            return res.status(400).json({
                success: false,
                error: 'اسم المتجر مطلوب للمالكين'
            });
        }

        shop = await Shop.create({
            name: shopName,
            businessType: 'retail'
        });
    }

    // إنشاء المستخدم
    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: role || 'employee',
        shop: shop?._id || null
    });

    // إذا كان مالكاً، نربط المتجر بالمستخدم
    if (shop && role === 'owner') {
        shop.owner = user._id;
        await shop.save();
    }

    res.status(201).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shop: user.shop,
            token: generateToken(user._id)
        }
    });
});

/**
 * @desc    تسجيل دخول مستخدم
 * @route   POST /api/users/login
 * @access  عام
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
            success: false,
            error: 'بريد إلكتروني أو كلمة مرور غير صحيحة'
        });
    }

    // تحديث وقت آخر تسجيل دخول
    user.lastLogin = Date.now();
    await user.save();

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shop: user.shop,
            token: generateToken(user._id)
        }
    });
});

/**
 * @desc    الحصول على بيانات المستخدم الحالي
 * @route   GET /api/users/me
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .select('-password')
        .populate('shop', 'name businessType');
    
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'المستخدم غير موجود'
        });
    }
    
    res.json({
        success: true,
        data: user
    });
});

/**
 * @desc    تحديث بيانات المستخدم
 * @route   PUT /api/users/me
 * @access  خاص (يتطلب تسجيل دخول)
 */
const updateUser = asyncHandler(async (req, res) => {
    const updates = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        avatar: req.body.avatar
    };

    // إزالة الحقول غير المعرفة
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const user = await User.findByIdAndUpdate(
        req.user.id,
        updates,
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'المستخدم غير موجود'
        });
    }

    res.json({
        success: true,
        data: user
    });
});

/**
 * @desc    تعطيل حساب المستخدم
 * @route   PUT /api/users/me/deactivate
 * @access  خاص (يتطلب تسجيل دخول)
 */
const deactivateUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { isActive: false },
        { new: true }
    ).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'المستخدم غير موجود'
        });
    }

    res.json({
        success: true,
        data: { message: 'تم تعطيل الحساب بنجاح' }
    });
});

/**
 * @desc    الحصول على قائمة جميع المستخدمين (للمديرين فقط)
 * @route   GET /api/users
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const getUsers = asyncHandler(async (req, res) => {
    // التحقق من الصلاحيات
    if (req.user.role !== 'owner' && req.user.role !== 'manager') {
        return res.status(403).json({
            success: false,
            error: 'غير مصرح لك بالوصول إلى هذه البيانات'
        });
    }

    const users = await User.find({})
        .select('-password')
        .populate('shop', 'name');

    res.json({
        success: true,
        data: users
    });
});

/**
 * @desc    تحديث بيانات مستخدم بواسطة المدير/المالك
 * @route   PUT /api/users/:id
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const updateUserByAdmin = asyncHandler(async (req, res) => {
    // التحقق من الصلاحيات
    if (req.user.role !== 'owner' && req.user.role !== 'manager') {
        return res.status(403).json({
            success: false,
            error: 'غير مصرح لك بهذا الإجراء'
        });
    }

    const updates = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        role: req.body.role,
        isActive: req.body.isActive
    };

    // إزالة الحقول غير المعرفة
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'المستخدم غير موجود'
        });
    }

    res.json({
        success: true,
        data: user
    });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUser,
    deactivateUser,
    getUsers,
    updateUserByAdmin
};