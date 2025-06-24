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
const { updateOrderStatus, orderStatus } = require('../../storage')
const { Core } = require('@adobe/aio-sdk')
const logger = Core.Logger('order-commerce-created', { level: 'error' })

/**
 * Sends the order created data to the external back-office application.
 *
 * @param {object} params - Environment parameters.
 * @param {object} data - Order data.
 * @param {object} preProcessed - Result of the pre-process logic, if any.
 * @returns {object} Returns the sending result if needed for post-process.
 */
async function sendData (params, data, preProcessed) {
  data.associations = Array.isArray(preProcessed) ? preProcessed : (Object.keys(preProcessed).length > 0 ? [preProcessed] : [])

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.HUBSPOT_ACCESS_TOKEN}`
      },
      body: JSON.stringify(data)
    })

    const responseData = await response.json()

    if (!response.ok) {
      await updateOrderStatus(params.data.increment_id, `${orderStatus.ERROR}`)
      logger.error(`There was en error during synchronization. Error message: ${responseData.message}`)
      return {
        success: false,
        statusCode: 500,
        body: { error: `There was en error during synchronization. Error message: ${responseData.message}` }
      }
    }

    await updateOrderStatus(params.data.increment_id, orderStatus.COMPLETED)
    return {
      success: true
    }
  } catch (error) {
    await updateOrderStatus(params.data.increment_id, `${orderStatus.ERROR}`)
    throw new Error(`HTTP error! status: ${error.message}`)
  }
}

module.exports = { sendData }
