const mongoose = require('mongoose');

const Contractor = new mongoose.Schema({
  firstName: String,
  picture: String,
  typeOfWork: {
    type: String,
    required: true,
    enum: ['plumbing', 'construction', 'electrical']
  },
  phone: String,
  rating: Number,
  latestReview: {
  	body: String,
  	author: String
  }
  location: { type: [Number], index: '2dsphere'}
}, { timestamps: true }), 
	

module.exports = mongoose.model('Contractor', Contractor);
