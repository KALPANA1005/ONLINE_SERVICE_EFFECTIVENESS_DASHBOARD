const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Service = require('../models/Service');
const bcrypt = require('bcryptjs');

// @desc  Get user dashboard stats
const getDashboard = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id }).populate('service', 'name');
    const services = await Service.find({ status: 'active' });
    const avgRating = feedbacks.length
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

    // Monthly feedback for chart
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        count: feedbacks.filter(f => new Date(f.createdAt).getMonth() === d.getMonth()).length
      };
    });

    res.json({
      totalServices: services.length,
      feedbackSubmitted: feedbacks.length,
      avgRating,
      recentFeedbacks: feedbacks.slice(-5).reverse(),
      monthlyFeedback: monthly,
      sentimentData: {
        positive: feedbacks.filter(f => f.sentiment === 'positive').length,
        neutral: feedbacks.filter(f => f.sentiment === 'neutral').length,
        negative: feedbacks.filter(f => f.sentiment === 'negative').length
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get notifications
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.notifications || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, updateProfile, getNotifications };
