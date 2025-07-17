const express = require('express');
const { 
  addSalesEntry, 
  getSalesHistory, 
  getAnalytics, 
  getMonthlyAnalytics 
} = require('../controllers/dailySalesController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add', protect, addSalesEntry);
router.get('/history', protect, getSalesHistory);
router.get('/analytics', protect, getAnalytics);
router.get('/monthly-analytics', protect, getMonthlyAnalytics);

// Add this if you need to get sales by franchisee
router.get('/franchisee/:id', protect, async (req, res) => {
  try {
    const sales = await DailySalesEntry.find({ franchiseeId: req.params.id });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;