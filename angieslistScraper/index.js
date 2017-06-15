require('dotenv').config({ path: `${__dirname}/../.env` });
const axios = require('axios');
const delay = require('delay');
const uuid = require('uuid');
const categories = require('./categories.json');

const db = require('../app/config/db');
const Contractor = require('../app/models/Contractor');

const httpClient = axios.create({
  baseURL: 'https://member.angieslist.com',
  headers: {
    'x-angi-applicationversion': '1.0.2633',
    'x-angi-sourceapplication': 'member-app'
  }
});

httpClient.interceptors.request.use(config => {
  config.headers.common['x-angi-requestid'] = uuid.v4();
  return config;
});

(async () => {
  try {
    const { ANGIESLIST_EMAIL, ANGIESLIST_PASSWORD } = process.env;
    await authorization(ANGIESLIST_EMAIL, ANGIESLIST_PASSWORD);

    console.log(`Authorized with ${ANGIESLIST_EMAIL}`);

    for (const categoryName of Object.keys(categories)) {
      const categoryId = categories[categoryName];
      const contractorIds = await loadCategory(categoryId);

      for (const contractorId of contractorIds) {
        try {
          const contractorInfo = await loadContractorInfo(contractorId);
          const contractorContacts = await loadContractorContacts(contractorId);

          await Contractor.findOneAndUpdate({ angieslistId: contractorId }, {
            $addToSet: { categories: categoryName },
            angieslistId: contractorId,
            name: contractorInfo.name,
            logo: contractorInfo.logo,
            hours: contractorInfo.hours,
            description: contractorInfo.description,
            servicesOffered: contractorInfo.servicesOffered,
            address: {
              type: contractorInfo.primaryAddress.addressType,
              firstLine: contractorInfo.primaryAddress.addressFirstLine,
              secondLine: contractorInfo.primaryAddress.addressSecondLine,
              city: contractorInfo.primaryAddress.city.name,
              region: contractorInfo.primaryAddress.region.abbreviation,
              country: contractorInfo.primaryAddress.country.abbreviation,
              postalCode: contractorInfo.primaryAddress.postalCode,
              location: contractorInfo.primaryAddress.longitude ? [
                contractorInfo.primaryAddress.longitude,
                contractorInfo.primaryAddress.latitude
              ] : []
            },
            contacts: {
              primaryPhone: contractorContacts.primaryPhoneNumber,
              secondaryPhone: contractorContacts.secondaryPhoneNumber,
              firstName: contractorContacts.firstName,
              lastName: contractorContacts.lastName,
              email: contractorContacts.email,
              website: contractorContacts.website
            }
          }, { upsert: true }); // create-or-update

          await delay(1000); // sleep 1s
        } catch (err) {
          console.log(contractorId);
          throw err;
        }
      }

      console.log(`Loaded ${contractorIds.length} contractors from category: ${categoryName}`);
    }
  } catch (err) {
    console.error(err);
  }

  db.disconnect();
})();

async function authorization(email, password) {
  const response = await httpClient.post('/member/mem/v1/login', { email, password });
  // save authorization cookies
  httpClient.defaults.headers.common.Cookie = response.headers['set-cookie']
    .map(setCookie => setCookie.split(';')[0])
    .join('; ');
}

async function loadCategory(categoryId) {
  const num = 1000;
  let offset = 0;

  const contractorIds = [];

  while (true) {
    const { data } = await httpClient.post('/gateway/search/v2/search/serviceProvider', {
      categoryId,
      advertisingZone: 3285,
      postalCode: "10001",
      addressId: 71136435,
      filters: {},
      allowMisspellings: true,
      num,
      offset
    });

    if (!data.results.length) break;

    contractorIds.push(...data.results.map(r => r.spid));

    // next page
    offset += num;
  }

  return contractorIds;
}

async function loadContractorInfo(contractorId) {
  const { data } = await httpClient.get(`/member/mem/v1/service_providers/${contractorId}`);
  return data;
}

async function loadContractorContacts(contractorId) {
  const { data } = await httpClient
    .get(`/member/mem/v1/service_providers/${contractorId}/contact_information`)

  return data;
}