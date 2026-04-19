const express = require('express');
const router = express.Router();
const { getDashboard, updateProfile, getNotifications } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboard);
router.put('/profile', protect, updateProfile);
router.get('/notifications', protect, getNotifications);

module.exports = router;

// Public services route for users
const Service = require('../models/Service');
router.get('/services', protect, async (req, res) => {
  try {
    const services = await Service.find({ status: 'active' }).select('name category status');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
