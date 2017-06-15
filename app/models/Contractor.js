const mongoose = require('mongoose');

const Contractor = new mongoose.Schema({
  angieslistId: String,
  name: String,
  firstName: String,
  lastName: String,
  image: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  location: {
    type: [Number],
    index: '2dsphere',
    sparse: true
  },
  phone: String,
  jobTypes: {
    type: [String],
    index: true,
    required: true
  },
  averageRating: {
    type: Number,
    default: 0.0
  }
}, { timestamps: true });

module.exports = mongoose.model('Contractor', Contractor);
