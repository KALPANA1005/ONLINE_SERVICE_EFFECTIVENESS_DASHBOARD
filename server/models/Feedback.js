const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' }
}, { timestamps: true });

// Simple AI-like sentiment analysis based on rating
feedbackSchema.pre('save', function (next) {
  if (this.rating >= 4) this.sentiment = 'positive';
  else if (this.rating === 3) this.sentiment = 'neutral';
  else this.sentiment = 'negative';
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);
