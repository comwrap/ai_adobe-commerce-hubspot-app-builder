const { getCustomerBySearchCriteria } = require('./commerce-customer-api-client')

/**
 * Get customer attribute from commerce
 *
 * @param {object} params - Data received by the action
 * @param {string} attributeCode - Attribute code
 * @param {*} attributeValue - Attribute value
 * @returns {Promise<string>} - Returns the SAP customer number
 */
async function getCommerceCustomerIdByAttribute (params, attributeCode, attributeValue) {
  const fetchedCustomer = await getCustomerBySearchCriteria(
    params.COMMERCE_BASE_URL,
    params.COMMERCE_CONSUMER_KEY,
    params.COMMERCE_CONSUMER_SECRET,
    params.COMMERCE_ACCESS_TOKEN,
    params.COMMERCE_ACCESS_TOKEN_SECRET,
    getSearchQueryString(attributeCode, attributeValue)
  )
  if (!fetchedCustomer || fetchedCustomer.items.length === 0) {
    return null
  }

  return fetchedCustomer.items[0].id
}

/**
 * Get search query string
 *
 * @param {string} attributeCode - Attribute code
 * @param {string} attributeValue - Attribute value
 * @returns {string} - Returns the search query string
 */
function getSearchQueryString (attributeCode, attributeValue) {
  return `searchCriteria[filter_groups][0][filters][0][field]=${attributeCode}` +
        `&searchCriteria[filter_groups][0][filters][0][value]=${attributeValue}` +
        '&searchCriteria[filter_groups][0][filters][0][condition_type]=eq'
}

module.exports = {
  getCommerceCustomerIdByAttribute
}
