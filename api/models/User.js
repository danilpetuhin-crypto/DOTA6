const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  login: { 
    type: String, 
    required: true, 
    unique: true, 
    minlength: 3, 
    maxlength: 20 
  },
  password: { type: String, required: true },
  subscription: { 
    type: String, 
    enum: ['free', 'pro'], 
    default: 'free' 
  },
  subExpires: { type: Date, default: null },
  licenseKey: { type: String, default: null },
  analysesToday: { type: Number, default: 0 },
  lastAnalysisDate: { type: Date, default: null },
  ip: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Хэширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Метод проверки пароля
userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
