// routes/purchaseRoutes.js
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('owner', 'manager'), purchaseController.createPurchase);
router.put('/:id', protect, authorize('owner', 'manager'), purchaseController.updatePurchase);
router.get('/', protect, purchaseController.getPurchases);
router.get('/:id', protect, purchaseController.getPurchase);

module.exports = router;