const _ = require('lodash');
const wrap = require('../common/expressAsyncWrap');
const Contractor = require('../models/Contractor');

async function findContractors(req, res, next) {
  req.checkQuery('lat').notEmpty();
  req.checkQuery('long').notEmpty();
  req.checkQuery('radius').notEmpty();

  const errors = await req.getValidationResult();
  if (!errors.isEmpty()) return res.status(412).send(errors.mapped());

  const type = req.query.type;
  const lattitude = Number(req.query.lat);
  const longtitude = Number(req.query.long);
  const radius = Number(req.query.radius);

  const radians = miles => miles / 3959;

  const query = {
    jobTypes: type,
    location: {
      $geoWithin: { $centerSphere: [[lattitude, longtitude], radians(radius)] }
    }
  };

  const contractors = await Contractor.find(_.omit(query, _.isUndefined)).limit(100);
  res.send(contractors);
}

module.exports = {
  findContractors: wrap(findContractors)
};
