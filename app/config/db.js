const mongoose = require('mongoose');
const logger = require('../services/logger');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on('error', err => {
  logger.error(err);
  logger.error('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit(1);
});