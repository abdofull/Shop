// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('owner', 'manager', 'employee'), customerController.createCustomer);
router.put('/:id', protect, authorize('owner', 'manager', 'employee'), customerController.updateCustomer);
router.get('/', protect, customerController.getCustomers);
router.get('/:id', protect, customerController.getCustomer);

module.exports = router;