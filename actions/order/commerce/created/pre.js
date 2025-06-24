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
const fetch = require('node-fetch')
const { getCustomer } = require('../../../customer/commerce-customer-api-client')
const { updateOrderStatus, orderStatus } = require('../../storage')
const { Core } = require('@adobe/aio-sdk')
const logger = Core.Logger('order-custom-grid-columns', { level: 'error' })

/**
 * This function holds any logic needed pre sending information to external backoffice application
 *
 * @param {object} params - Data received before transformation
 * @param {object} transformed - Transformed received data
 * @returns {Array} items
 */
async function preProcess (params, transformed) {
  await updateOrderStatus(params.data.increment_id, orderStatus.IN_PROGRESS)

  const customerAssociations = await getCustomerAssociations(params)
  const itemAssociations = await getItemAssociations(params)

  return [...customerAssociations, ...itemAssociations]
}

/**
 *
 * @param {object} params incoming params
 * @returns {Array} associations list
 */
async function getCustomerAssociations (params) {
  const associations = []

  if (params.data.customer_id) {
    const commerceCustomer = await getCustomer(
      params.COMMERCE_BASE_URL,
      params,
      params.data.customer_id
    )

    const contactId = commerceCustomer.custom_attributes.find(
      (attribute) => attribute.attribute_code === params.COMMERCE_HUBSPOT_CONTACT_ID_FIELD
    )?.value

    if (contactId) {
      associations.push({
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 507 }]
      })
    }
  }

  return associations
}

/**
 *
 * @param {object} params incoming params
 * @returns {Array} associations list
 */
async function getItemAssociations (params) {
  const associations = []
  let response = null

  for (const item of params.data.items) {
    const body = {
      properties: {
        hs_line_item_id: item.id,
        quantity: item.qty_ordered,
        hs_sku: item.sku,
        price: item.price,
        name: item.name
      }
    }

    try {
      response = await fetch('https://api.hubapi.com/crm/v3/objects/line_items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${params.HUBSPOT_ACCESS_TOKEN}`
        },
        body: JSON.stringify(body)
      })
    } catch (error) {
      logger.error(`There was en error during line item creation. Error message: ${error.message}`)
      throw new Error(`There was en error during line item creation. Error message: ${error.message}`)
    }

    const responseData = await response.json()
    if (responseData.status === 'error') {
      logger.error(`There was en error during line item creation. Error message: ${responseData.message}`)
      throw new Error(`There was en error during line item creation. Error message: ${responseData.message}`)
    }

    associations.push({
      to: { id: responseData.id },
      types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 513 }]
    })
  }

  return associations
}

module.exports = { preProcess }
