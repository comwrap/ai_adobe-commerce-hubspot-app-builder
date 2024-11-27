/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { getCustomer } = require('../../commerce-customer-api-client')
const { getContactAddressProperties, getCompanyIdByExternalId } = require('../../hubspot-api-client')
const { Core } = require('@adobe/aio-sdk')

/**
 * This function hold any logic needed pre sending information to external backoffice application
 *
 * @param {object} params - Data received before transformation
 * @param {object} transformed - Transformed received data
 * @returns {object} pre processed data
 */
async function preProcess (params, transformed) {
  const logger = Core.Logger('customer-commerce-updated', { level: params.LOG_LEVEL || 'info' })
  if (!params.data.id) {
    return transformed
  }

  const commerceCustomer = await getCustomer(
    params.COMMERCE_BASE_URL,
    params.COMMERCE_CONSUMER_KEY,
    params.COMMERCE_CONSUMER_SECRET,
    params.COMMERCE_ACCESS_TOKEN,
    params.COMMERCE_ACCESS_TOKEN_SECRET,
    params.data.id
  )

  // TODO if defaultBillingAddress is undefined remove address from hubspot
  const defaultBillingAddress = commerceCustomer.addresses?.find(address => address.default_billing)
  if (!defaultBillingAddress) {
    return transformed
  }

  const contactAddressMapped = {
    address: defaultBillingAddress.street[0],
    city: defaultBillingAddress.city,
    state: defaultBillingAddress.region.region_code,
    zip: defaultBillingAddress.postcode,
    country: defaultBillingAddress.country_id
  }

  const contactId = params.data[params.COMMERCE_HUBSPOT_CONTACT_ID_FIELD]
  logger.debug('id field ', params.COMMERCE_HUBSPOT_CONTACT_ID_FIELD)
  logger.debug('params data', params.data)
  logger.debug('ContactId to update in preProcess ', contactId)

  const contactProperties = await getContactAddressProperties(params.HUBSPOT_ACCESS_TOKEN, contactId)
  const currentContactAddress = {
    address: contactProperties.properties.address,
    city: contactProperties.properties.city,
    state: contactProperties.properties.state,
    zip: contactProperties.properties.zip,
    country: contactProperties.properties.country
  }

  if (JSON.stringify(currentContactAddress) === JSON.stringify(contactAddressMapped)) {
    return transformed
  }
  if (params.data.hasOwnProperty('company_attributes') && params.data.company_attributes.company_id !== 0) {
    const companyId = await getCompanyIdByExternalId(params.HUBSPOT_ACCESS_TOKEN, params.data.company_attributes.company_id)
    return { ...transformed, ...contactAddressMapped, hubspot_company_id: companyId }
  }

  logger.debug('Updating customer address in HubSpot')
  return { ...transformed, ...contactAddressMapped }
}

module.exports = {
  preProcess
}
