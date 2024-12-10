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

const { Core } = require('@adobe/aio-sdk')

/**
 * This function transform the received customer data from external back-office application to Adobe commerce
 *
 * @param {object} params - Data received from Adobe commerce
 * @param {object} customer - Transformed received data
 * @returns {object} - Returns transformed data object
 */
function transformData (params, customer) {
  const logger = Core.Logger('customer-external-updated', { level: params.LOG_LEVEL || 'info' })

  const defaultBilling = customer.addresses?.find(address => address.default_billing)
  const addressId = defaultBilling?.id ? defaultBilling.id : 0
  // TODO: If adding a new address firstname, lastname and telephone and country_id are required
  // TODO add telephone as a field of the backoffice customer update event to be included in here
  const telephoneNumber = '1234567890'

  logger.debug('Address ID: ', addressId)
  return {
    customer: {
      id: customer.id,
      firstname: params.data.firstname,
      lastname: params.data.lastname,
      email: params.data.email,
      addresses: [{
        id: addressId,
        street: [params.data.address],
        city: params.data.city,
        // ToDo: figure out how to get region ID by the code, county_id and region_id depend on each other
        // region_id: params.data.state ,
        country_id: params.data.country,
        postcode: params.data.zip,
        default_billing: true,
        firstname: params.data.firstname,
        lastname: params.data.lastname,
        telephone: telephoneNumber
      }],
      custom_attributes: [
        {
          attribute_code: params.COMMERCE_HUBSPOT_CONTACT_ID_FIELD,
          value: `${params.data.id}`
        }
      ]
    }
  }
}

module.exports = {
  transformData
}
