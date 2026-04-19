const express = require('express');
const router = express.Router();
const { submitFeedback, getUserFeedbacks, getAllFeedbacks, updateFeedbackStatus } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.post('/', protect, submitFeedback);
router.get('/my', protect, getUserFeedbacks);
router.get('/all', protect, adminOnly, getAllFeedbacks);
router.put('/:id/status', protect, adminOnly, updateFeedbackStatus);

module.exports = router;
