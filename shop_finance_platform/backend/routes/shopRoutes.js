// routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, shopController.createShop);
router.put('/:id', protect, shopController.updateShop);
router.get('/:id', protect, shopController.getShop);

module.exports = router;