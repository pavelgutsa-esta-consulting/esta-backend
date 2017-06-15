require('dotenv').config({ path: `${__dirname}/../.env` });
const db = require('../app/config/db');
const Contractor = require('../app/models/Contractor');

(async () => {
  const contractors = await Contractor.find();
  for (const c of contractors) {
    c.address.street = c.address.street.trim();
    await c.save();
  }
  db.connection.close();
})();
