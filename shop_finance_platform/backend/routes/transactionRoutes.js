// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, transactionController.createTransaction);
router.get('/', protect, transactionController.getTransactions);
router.get('/stats', protect, transactionController.getTransactionStats);

module.exports = router;