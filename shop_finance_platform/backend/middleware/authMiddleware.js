// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Employee = require('../models/Employee');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id).select('-password');
            
            // إضافة shopId و employeeId إذا كان المستخدم مرتبط بمتجر أو موظف
            if (req.user.role === 'owner') {
                const shop = await Shop.findOne({ owner: req.user._id });
                if (shop) {
                    req.user.shopId = shop._id;
                }
            } else if (req.user.role === 'manager' || req.user.role === 'employee') {
                const employee = await Employee.findOne({ user: req.user._id });
                if (employee) {
                    req.user.shopId = employee.shop;
                    req.user.employeeId = employee._id;
                }
            }
            
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('غير مصرح، فشل التحقق من التوكن');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('غير مصرح، لا يوجد توكن');
    }
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error('ليس لديك صلاحية للقيام بهذا الإجراء');
        }
        next();
    };
};

module.exports = { protect, authorize };