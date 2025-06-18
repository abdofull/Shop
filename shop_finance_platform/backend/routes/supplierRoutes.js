// routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('owner', 'manager'), supplierController.createSupplier);
router.put('/:id', protect, authorize('owner', 'manager'), supplierController.updateSupplier);
router.get('/', protect, supplierController.getSuppliers);
router.get('/:id', protect, supplierController.getSupplier);

module.exports = router;