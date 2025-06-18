// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('owner', 'manager', 'employee'), invoiceController.createInvoice);
router.put('/:id', protect, authorize('owner', 'manager'), invoiceController.updateInvoice);
router.get('/', protect, invoiceController.getInvoices);
router.get('/:id', protect, invoiceController.getInvoice);

module.exports = router;