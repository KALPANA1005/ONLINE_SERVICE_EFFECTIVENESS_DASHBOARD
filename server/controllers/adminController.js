const User = require('../models/User');
const Service = require('../models/Service');
const Feedback = require('../models/Feedback');

// @desc  Get admin dashboard stats
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const totalServices = await Service.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);

    const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('-password');
    const allFeedback = await Feedback.find().populate('user', 'name email').populate('service', 'name').sort({ createdAt: -1 });

    const sentimentData = {
      positive: await Feedback.countDocuments({ sentiment: 'positive' }),
      neutral: await Feedback.countDocuments({ sentiment: 'neutral' }),
      negative: await Feedback.countDocuments({ sentiment: 'negative' })
    };

    res.json({
      stats: {
        totalUsers, activeUsers, totalServices, totalFeedback,
        avgRating: avgRating[0]?.avg?.toFixed(1) || 0
      },
      recentUsers,
      allFeedback,
      sentimentData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create user (admin)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, password, role: role || 'user' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, email, isActive, role } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create service
const createService = async (req, res) => {
  try {
    const service = await Service.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update service
const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Export CSV
const exportCSV = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('user', 'name email').populate('service', 'name');
    const rows = ['User,Email,Service,Rating,Sentiment,Status,Date'];
    feedbacks.forEach(f => {
      rows.push(`${f.user?.name},${f.user?.email},${f.service?.name},${f.rating},${f.sentiment},${f.status},${new Date(f.createdAt).toLocaleDateString()}`);
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
    res.send(rows.join('\n'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, getAllUsers, createUser, updateUser, deleteUser, getAllServices, createService, updateService, deleteService, exportCSV };
