const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  sessionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Session', 
    required: true 
  },
  hole: [{ type: String }],
  board: [{ type: String }],
  equity: { type: Number },
  combo: { type: String },
  action: { type: String },
  actionClass: { type: String },
  pot: { type: Number, default: 0 },
  outcome: { type: String, enum: ['win', 'lose'], default: 'lose' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);
