const express = require('express');
const { protect, admin } = require('../middleware/auth');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalLost = await LostItem.countDocuments();
    const totalFound = await FoundItem.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Aggregate items by category
    const categoryStats = await FoundItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const formattedCategories = categoryStats.map(stat => ({
      name: stat._id,
      value: stat.count
    }));

    // For the line chart (mocking the last 7 days of data for simplicity, usually done via grouping by Date)
    const lineData = [
      { name: 'Mon', lost: Math.floor(Math.random() * 10), found: Math.floor(Math.random() * 10) },
      { name: 'Tue', lost: Math.floor(Math.random() * 10), found: Math.floor(Math.random() * 10) },
      { name: 'Wed', lost: Math.floor(Math.random() * 10), found: Math.floor(Math.random() * 10) },
      { name: 'Thu', lost: Math.floor(Math.random() * 10), found: Math.floor(Math.random() * 10) },
      { name: 'Fri', lost: Math.floor(Math.random() * 10), found: Math.floor(Math.random() * 10) },
      { name: 'Sat', lost: Math.floor(Math.random() * 10), found: Math.floor(Math.random() * 10) },
      { name: 'Sun', lost: Math.floor(Math.random() * 10), found: Math.floor(Math.random() * 10) },
    ];

    res.json({
      totals: { lost: totalLost, found: totalFound, users: totalUsers },
      categories: formattedCategories,
      trend: lineData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
