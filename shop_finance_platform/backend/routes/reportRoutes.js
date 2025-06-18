// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('owner', 'manager'), reportController.createReport);
router.get('/', protect, reportController.getReports);
router.get('/:id', protect, reportController.getReport);

module.exports = router;