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

/**
 * This function transform the received customer data from external back-office application to Adobe commerce
 *
 * @param {object} params - Data received from Adobe commerce
 * @param {object} customer
 * @returns {object} - Returns transformed data object
 */
function transformData (params, customer) {
  const defaultBilling = customer.addresses.find(address => address.default_billing);
  return {
    customer: {
      id: customer.id,
      firstname: params.data.name,
      lastname: params.data.lastname,
      email: params.data.email,
      address: [{
        id: defaultBilling.id,
        street: [params.data.address],
        city: params.data.city,
        // ToDo: figure out how to get region ID by the code
        // region_id: params.data.state ,
        zip: params.data.zip,
        country: params.data.country,
      }],
      custom_attributes: [
        {
            attribute_code: params.COMMERCE_HUBSPOT_CONTACT_ID_FIELD,
            value: params.data.id
        }
      ]
    }
  }
}

module.exports = {
  transformData
}
