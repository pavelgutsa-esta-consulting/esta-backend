// load environment variables from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const logger = require('./app/services/logger');

// controllers
const contractorsController = require('./app/controllers/contractorsController');

// modules configuration loading
require('./app/config/db');

const app = express();
app.use(bodyParser.json());
app.use(expressValidator());
app.get('/api/contractors/find', contractorsController.findContractors);

app.listen(process.env.PORT, () => {
  logger.info('Server started on port', process.env.PORT);
});

// export app for test purposes
module.exports = app;
