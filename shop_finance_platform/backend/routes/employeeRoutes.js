// routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('owner', 'manager'), employeeController.createEmployee);
router.put('/:id', protect, authorize('owner', 'manager'), employeeController.updateEmployee);
router.post('/:id/link-user', protect, authorize('owner', 'manager'), employeeController.linkUserToEmployee);
router.get('/', protect, employeeController.getEmployees);
router.get('/:id', protect, employeeController.getEmployee);

module.exports = router;