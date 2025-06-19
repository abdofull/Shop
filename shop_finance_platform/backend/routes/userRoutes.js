const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// تسجيل مستخدم جديد
router.post('/register', userController.registerUser);

// تسجيل دخول مستخدم
router.post('/login', userController.loginUser);

// الحصول على بيانات المستخدم الحالي
router.get('/me', protect, userController.getMe);

// تحديث بيانات المستخدم
router.put('/me', protect, userController.updateUser);

// تعطيل حساب المستخدم
router.put('/me/deactivate', protect, userController.deactivateUser);

// الحصول على قائمة جميع المستخدمين (للمديرين فقط)
router.get('/', protect, userController.getUsers);

// تحديث بيانات مستخدم بواسطة المدير/المالك
router.put('/:id', protect, userController.updateUserByAdmin);

module.exports = router;