const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, default: 'General' },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  completionRate: { type: Number, default: 0, min: 0, max: 100 },
  avgResponseTime: { type: Number, default: 0 },
  totalRequests: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
