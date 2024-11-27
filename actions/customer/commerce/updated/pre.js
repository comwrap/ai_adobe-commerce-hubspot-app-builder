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

<<<<<<< Updated upstream
const { getCustomer } = require('../../commerce-customer-api-client')
const { getContactAddressProperties } = require('../../hubspot-api-client')
const { Core } = require('@adobe/aio-sdk')
=======
const {getCustomer} = require("../../commerce-customer-api-client");
const {getContactAddressProperties, getCompanyIdByExternalId} = require("../../hubspot-api-client");
const {Core} = require("@adobe/aio-sdk");
>>>>>>> Stashed changes

/**
 * This function hold any logic needed pre sending information to external backoffice application
 *
 * @param {object} params - Data received before transformation
 * @param {object} transformed - Transformed received data
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

  const defaultBillingAddress = commerceCustomer.addresses.find(address => address.default_billing)
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
  logger.debug('ContactId to update in preProcess ', contactId)

  const contactProperties = await getContactAddressProperties(params.HUBSPOT_ACCESS_TOKEN, contactId)
  const currentContactAddress = {
    address: contactProperties.properties.address,
    city: contactProperties.properties.city,
    state: contactProperties.properties.state,
    zip: contactProperties.properties.zip,
    country: contactProperties.properties.country
  }

<<<<<<< Updated upstream
  if (JSON.stringify(currentContactAddress) === JSON.stringify(contactAddressMapped)) {
    return transformed
  }
=======
    if (JSON.stringify(currentContactAddress) === JSON.stringify(contactAddressMapped)) {
        return transformed;
    }
    if (params.data.hasOwnProperty("company_attributes")) {
        const companyId = await getCompanyIdByExternalId(params.HUBSPOT_ACCESS_TOKEN, params.data.company_attributes.company_id)
        return { ...transformed, ...contactAddressMapped,  hubspot_company_id: companyId};
    }
>>>>>>> Stashed changes

  logger.debug('Updating customer address in HubSpot')
  return { ...transformed, ...contactAddressMapped }
}

module.exports = {
  preProcess
}
