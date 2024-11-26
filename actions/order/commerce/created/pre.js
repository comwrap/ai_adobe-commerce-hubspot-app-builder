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

const fetch = require("node-fetch");
const {Core} = require("@adobe/aio-sdk");
const {stringParameters} = require("../../../utils");
const { getCustomer } = require('../../../customer/commerce-customer-api-client')
const { updateOrderStatus, orderStatus } = require('../../storage')

/**
 * This function holds any logic needed pre sending information to external backoffice application
 *
 * @param {object} params - Data received before transformation
 * @param {object} transformed - Transformed received data
 */
async function preProcess(params, transformed) {
  const logger = Core.Logger('order-commerce-transformer-created', { level: 'debug' || 'info' })

  await updateOrderStatus(params.data.increment_id, orderStatus.IN_PROGRESS)

  let associations = []

  if (params.data.customer_id) {
    const commerceCustomer = await getCustomer(
        params.COMMERCE_BASE_URL,
        params.COMMERCE_CONSUMER_KEY,
        params.COMMERCE_CONSUMER_SECRET,
        params.COMMERCE_ACCESS_TOKEN,
        params.COMMERCE_ACCESS_TOKEN_SECRET,
        params.data.customer_id
    )
    let contactId = null;
    commerceCustomer.custom_attributes.forEach((attribute) => {
      if (attribute.attribute_code === params.COMMERCE_HUBSPOT_CONTACT_ID_FIELD) {
        contactId = attribute.value;
      }
    });
    if (contactId) {
      associations.push({
        to: {
          id: contactId,
        },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 507, // Contact to Order
          },
        ],
      });
    }
  }

  for (let i = 0; i < params.data.items.length; i++) {
    const item = params.data.items[i];
    const body = {
      properties: {
        hs_line_item_id: item.id,
        quantity: item.qty_ordered,
        // hs_product_id: item.product_id,
        hs_sku: item.sku,
        price: item.price,
        name: item.name,
      },
    };
    try {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/line_items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.HUBSPOT_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(body),
      });
      const responseData = await response.json();
      if (responseData.hasOwnProperty('status') && responseData.status === 'error') {
        throw new Error(`HTTP error! status: ${responseData.message}`);
      }
      logger.debug('Response data: ', JSON.stringify(responseData));
      associations.push({
        to: {
          id: responseData.id,
        },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 513, // Item to Order
          },
        ],
      });
    } catch (error) {
      throw new Error(`HTTP error! status: ${error.message}`);
    }
  }

  logger.debug('associations: ', JSON.stringify(associations));
  return associations;
}

module.exports = {
  preProcess,
};
