const hubspot = require('@hubspot/api-client')
const { Core } = require('@adobe/aio-sdk')

/**
 *
 * @param {string} token token
 * @param {object} data data
 * @param {object} preProcess preProcess
 * @returns {Promise} promise
 */
async function createContact (token, data, preProcess = {}) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })
  const logger = Core.Logger('hubspot-api-client', { level: 'info' })
  const properties = data
  const associations = []
  logger.info('Pre process in create content'+ JSON.stringify(preProcess))
  if (preProcess.hasOwnProperty('hubspot_company_id') && preProcess.hubspot_company_id !== null) {
    associations.push({
      to: { id: preProcess.hubspot_company_id },
      types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 279 }]
    })
  }
  logger.info('Associations'+ JSON.stringify(associations))

  const SimplePublicObjectInputForCreate = { associations, properties }

  return await hubspotClient.crm.contacts.basicApi.create(SimplePublicObjectInputForCreate)
}

/**
 *
 * @param {string} token token
 * @param {object} data data
 * @param {string} contactId contact
 * @param {object} companyId companyId
 * @returns {Promise} promise
 */
async function updateContact (token, data, contactId, companyId = null) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })
  const logger = Core.Logger('hubspot-api-client', { level: 'info' })
  const properties = data

  const SimplePublicObjectInput = { properties }

  if (companyId !== null) {
    const BatchInputPublicDefaultAssociationMultiPost = { inputs: [{"_from":{"id":contactId},"to":{"id":companyId}}] };
    const fromObjectType = "contact";
    const toObjectType = "company";
    const apiResponse = await hubspotClient.crm.associations.v4.batchApi.createDefault(fromObjectType, toObjectType, BatchInputPublicDefaultAssociationMultiPost);
    logger.info('api respones associate default:' , JSON.stringify(apiResponse))
  }

  return await hubspotClient.crm.contacts.basicApi.update(contactId, SimplePublicObjectInput)
}

/**
 *
 * @param {string} token token
 * @param {object} data data
 * @returns {Promise} promise
 */
async function createCompany (token, data) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })

  const properties = data
  const SimplePublicObjectInputForCreate = { associations: [], properties }

  return await hubspotClient.crm.companies.basicApi.create(SimplePublicObjectInputForCreate)
}

/**
 *
 * @param {string} token token
 * @param {object} data data
 * @param {string} contactId contact
 * @returns {Promise} promise
 */
async function updateCompany (token, data, contactId) {
  const hubspotClient = new hubspot.Client({ accessToken: `${token}` })
  const properties = data

  const SimplePublicObjectInput = { properties }

  return await hubspotClient.crm.companies.basicApi.update(contactId, SimplePublicObjectInput)
}

/**
 *
 * @param {string} token token
 * @param {number} limit limit
 * @param {string} after after
 * @returns {Promise} promise
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
 * @param {string} token token
 * @param {string} contactId contactid
 * @returns {Promise} promise
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
 * @param {string} token token
 * @param {string} externalId external id
 * @returns {Promise} promise
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
