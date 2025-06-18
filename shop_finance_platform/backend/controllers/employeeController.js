// controllers/employeeController.js
const Employee = require('../models/Employee');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

/**
 * @desc    إنشاء موظف جديد
 * @route   POST /api/employees
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const createEmployee = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { name, email, phone, position, salary, startDate, address, emergencyContact, nationalId, bankAccount, notes } = req.body;

    const employee = await Employee.create({
        shop: shopId,
        name,
        email,
        phone,
        position,
        salary,
        startDate,
        address,
        emergencyContact,
        nationalId,
        bankAccount,
        notes
    });

    res.status(201).json(employee);
});

/**
 * @desc    تحديث بيانات موظف
 * @route   PUT /api/employees/:id
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const updateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;
    const { name, email, phone, position, salary, isActive, address, emergencyContact, nationalId, bankAccount, notes } = req.body;

    const employee = await Employee.findOne({ _id: id, shop: shopId });
    if (!employee) {
        res.status(404);
        throw new Error('الموظف غير موجود');
    }

    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    employee.position = position || employee.position;
    employee.salary = salary || employee.salary;
    employee.isActive = isActive !== undefined ? isActive : employee.isActive;
    employee.address = address || employee.address;
    employee.emergencyContact = emergencyContact || employee.emergencyContact;
    employee.nationalId = nationalId || employee.nationalId;
    employee.bankAccount = bankAccount || employee.bankAccount;
    employee.notes = notes || employee.notes;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
});

/**
 * @desc    الحصول على قائمة الموظفين
 * @route   GET /api/employees
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getEmployees = asyncHandler(async (req, res) => {
    const { shopId } = req.user;
    const { isActive, position } = req.query;

    let query = { shop: shopId };
    if (isActive !== undefined) query.isActive = isActive;
    if (position) query.position = position;

    const employees = await Employee.find(query).sort('-createdAt');
    res.json(employees);
});

/**
 * @desc    الحصول على تفاصيل موظف
 * @route   GET /api/employees/:id
 * @access  خاص (يتطلب تسجيل دخول)
 */
const getEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;

    const employee = await Employee.findOne({ _id: id, shop: shopId });
    if (!employee) {
        res.status(404);
        throw new Error('الموظف غير موجود');
    }

    res.json(employee);
});

/**
 * @desc    ربط حساب مستخدم بموظف
 * @route   POST /api/employees/:id/link-user
 * @access  خاص (يتطلب صلاحيات مدير/مالك)
 */
const linkUserToEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { shopId } = req.user;
    const { userId } = req.body;

    // التحقق من وجود الموظف
    const employee = await Employee.findOne({ _id: id, shop: shopId });
    if (!employee) {
        res.status(404);
        throw new Error('الموظف غير موجود');
    }

    // التحقق من وجود المستخدم
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('المستخدم غير موجود');
    }

    // تحديث الموظف
    employee.user = userId;
    await employee.save();

    // تحديث المستخدم
    user.role = employee.position === 'manager' ? 'manager' : 'employee';
    await user.save();

    res.json({ message: 'تم ربط الحساب بنجاح' });
});

module.exports = {
    createEmployee,
    updateEmployee,
    getEmployees,
    getEmployee,
    linkUserToEmployee
};