const winston = require('winston');

const logger = new (winston.Logger)({
  transports: [
    // for now write logs only to stdout
    new (winston.transports.Console)({
      timestamp: true
    })
  ]
});

module.exports = logger;
