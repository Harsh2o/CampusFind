const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  dateFound: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String },
  contactInfo: { type: String, required: true },
  imagePath: { type: String },
  itemStatus: { type: String, default: 'Unclaimed' },
  lat: { type: Number },
  lng: { type: Number },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('FoundItem', foundItemSchema);
