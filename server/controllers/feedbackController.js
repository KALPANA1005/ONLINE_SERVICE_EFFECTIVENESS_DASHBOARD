const Feedback = require('../models/Feedback');
const Service = require('../models/Service');

// @desc  Submit feedback
const submitFeedback = async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body;
    if (!serviceId || !rating) return res.status(400).json({ message: 'Service and rating required' });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const feedback = await Feedback.create({
      user: req.user._id, service: serviceId, rating, comment
    });

    // Update service stats
    const allFeedback = await Feedback.find({ service: serviceId });
    service.totalRequests = allFeedback.length;
    service.completionRate = Math.round((allFeedback.filter(f => f.status !== 'pending').length / allFeedback.length) * 100);
    await service.save();

    await feedback.populate('service', 'name');
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get user feedbacks
const getUserFeedbacks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Feedback.countDocuments({ user: req.user._id });
    const feedbacks = await Feedback.find({ user: req.user._id })
      .populate('service', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);

    res.json({ feedbacks, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get all feedbacks (admin)
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email')
      .populate('service', 'name')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update feedback status
const updateFeedbackStatus = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitFeedback, getUserFeedbacks, getAllFeedbacks, updateFeedbackStatus };
