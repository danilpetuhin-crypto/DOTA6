const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { type: String, default: 'Текущая сессия' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Session || mongoose.model('Session', sessionSchema);
