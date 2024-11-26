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
const { updateOrderStatus, orderStatus } = require('../../storage')

/**
 * This function send the order created data to the external back-office application
 *
 * @param {object} params - include the env params
 * @param {object} data - order data
 * @param {object} preProcessed - result of the pre-process logic if any
 * @returns {object} returns the sending result if needed for post process
 */
async function sendData (params, data, preProcessed) {
  // @TODO Here add the logic to send the information to 3rd party
  // @TODO Use params to retrieve need parameters from the environment
  // @TODO in case of error return { success: false, statusCode: <error status code>, message: '<error message>' }
  const fetch = require('node-fetch');
  const logger = Core.Logger('order-commerce-transformer-created', { level: 'debug' || 'info' })

  data.associations = preProcessed;
  logger.debug('data: ' + JSON.stringify(data))

  try {
    let response = await fetch('https://api.hubapi.com/crm/v3/objects/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.HUBSPOT_ACCESS_TOKEN}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      await updateOrderStatus(data.increment_id, orderStatus.ERROR + '|' . response.message);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    await response.json();

    await updateOrderStatus(data.increment_id, orderStatus.COMPLETED);
    return {
      success: true
    }
  } catch (error) {
    await updateOrderStatus(data.increment_id, orderStatus.ERROR + '|' . error.message);
    throw new Error(`HTTP error! status: ${error.message}`);
  }
}

module.exports = {
  sendData
}
