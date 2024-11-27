const hubspot = require('@hubspot/api-client')

/**
 *
 * @param {string} token
 * @param data
 */
async function createContact (token, data) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })

  const properties = data
  const SimplePublicObjectInputForCreate = { associations: [], properties }

  return await hubspotClient.crm.contacts.basicApi.create(SimplePublicObjectInputForCreate)
}

/**
 *
 * @param token
 * @param data
 * @param contactId
 */
async function updateContact (token, data, contactId) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })
  const properties = data

  const SimplePublicObjectInput = { properties }

  return await hubspotClient.crm.contacts.basicApi.update(contactId, SimplePublicObjectInput)
}

/**
 *
 * @param token
 * @param data
 */
async function createCompany (token, data) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })

  const properties = data
  const SimplePublicObjectInputForCreate = { associations: [], properties }

  return await hubspotClient.crm.companies.basicApi.create(SimplePublicObjectInputForCreate)
}

/**
 *
 * @param token
 * @param data
 * @param contactId
 */
async function updateCompany (token, data, contactId) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })
  const properties = data

  const SimplePublicObjectInput = { properties }

  return await hubspotClient.crm.companies.basicApi.update(contactId, SimplePublicObjectInput)
}

/**
 *
 * @param token
 * @param limit
 * @param after
 */
async function getContactsPage (token, limit, after) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })

  return await hubspotClient.crm.contacts.basicApi.getPage(
    limit, // Number of records per page
    after // Cursor for pagination
  )
}

/**
 *
 * @param token
 * @param contactId
 */
async function getContactAddressProperties (token, contactId) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })

  const properties = [
    'address',
    'city',
    'state',
    'zip',
    'country'
  ]

  return await hubspotClient.crm.contacts.basicApi.getById(contactId, properties)
}

/**
 *
 * @param {string} token
 * @param externalId
 */
async function getCompanyIdByExternalId (token, externalId) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })

  const searchRequest = {
    filterGroups: [
      {
        filters: [
          {
            propertyName: 'external_company_id',
            operator: 'CONTAINS_TOKEN',
            value: externalId
          }
        ]
      }
    ]
  }
  const results = await hubspotClient.crm.companies.searchApi.doSearch(searchRequest)
  if (results.results.length === 0) {
    return null
  }
  return results.results[0].id
}

module.exports = {
  createContact,
  getContactsPage,
  updateContact,
  getContactAddressProperties,
  createCompany,
  updateCompany,
  getCompanyIdByExternalId
}
