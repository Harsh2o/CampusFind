const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  dateLost: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String },
  contactInfo: {
    type: String,
    required: true
  },
  itemStatus: {
    type: String,
    default: 'Lost'
  },
  imagePath: {
    type: String
  },
  lat: {
    type: Number
  },
  lng: {
    type: Number
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('LostItem', lostItemSchema);
