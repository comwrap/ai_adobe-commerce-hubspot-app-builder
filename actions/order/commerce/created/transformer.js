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

const {Core} = require("@adobe/aio-sdk");
const {stringParameters} = require("../../../utils");

/**
 * This function transform the received order data from Adobe commerce to external back-office application
 *
 * @param {object} data - Data received from Adobe commerce
 * @returns {object} - Returns transformed data object
 */
function transformData (data) {
  const logger = Core.Logger('order-commerce-transformer-created', { level: 'debug' || 'info' })
  let shippingAddress = 0;
  // @TODO Here transform the data as needed for 3rd party API
  for (const address of data.addresses ) {
    if (address.entity_id === data.shipping_address_id) {
      shippingAddress = address;
      break
    }
  }

  const transformedData = {
    properties: {
      hs_order_name: data.increment_id,
      hs_currency_code: data.order_currency_code,
      hs_source_store: data.store_name,
      hs_fulfillment_status: "New",
      hs_shipping_address_city: shippingAddress.city,
      hs_shipping_address_state: shippingAddress.region,
      hs_shipping_address_street: shippingAddress.street
    },
    associations: [
      {
        to: {
          id: 34096810229
        },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 513 // Item to Order
          }
        ]
      }
    ]
  }

  return transformedData
}

module.exports = {
  transformData
}
