const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel' // Dynamic reference to either Student or Teacher
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'onModel' // Dynamic reference to either Student or Teacher
  },
  onModel: {
    type: String,
    required: true,
    enum: ['Student', 'Teacher'] // Discriminator for dynamic reference
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema); 