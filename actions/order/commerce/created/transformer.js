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
      hs_external_order_id: data.entity_id,
      hs_order_name: data.increment_id,
      hs_currency_code: data.order_currency_code,
      hs_source_store: data.store_name,
      hs_fulfillment_status: "New",
      hs_shipping_address_city: shippingAddress.city,
      hs_shipping_address_state: shippingAddress.region,
      hs_shipping_address_street: shippingAddress.street,
      hs_shipping_address_postal_code: shippingAddress.postcode,
      hs_shipping_address_country: shippingAddress.country_id,
      hs_total_price: data.grand_total,
      hs_subtotal_price: data.subtotal,
      hs_tax: data.tax_amount,
      hs_shipping_cost: data.shipping_amount,
      hs_order_discount: data.discount_amount,
      // hs_external_created_date: data.created_at,
      hs_billing_address_email: data.customer_email,
      hs_billing_address_firstname: data.customer_firstname,
      hs_billing_address_lastname: data.customer_lastname,
      hs_payment_processing_method: data.payment.method
    }
  }

  return transformedData
}

module.exports = {
  transformData
}
