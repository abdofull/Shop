// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('owner', 'manager'), productController.createProduct);
router.put('/:id', protect, authorize('owner', 'manager'), productController.updateProduct);
router.get('/', protect, productController.getProducts);
router.get('/:id', protect, productController.getProduct);
router.patch('/:id/stock', protect, authorize('owner', 'manager'), productController.updateStock);

module.exports = router;