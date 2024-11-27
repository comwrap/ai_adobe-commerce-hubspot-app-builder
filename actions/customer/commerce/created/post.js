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
const { updateCustomer } = require('../../commerce-customer-api-client')
const { HTTP_INTERNAL_ERROR } = require('../../../constants')
const { Core } = require('@adobe/aio-sdk')
/**
 * This function hold any logic needed post sending information to external backoffice application
 *
 * @param {object} params - data received before transformation
 * @param {object} result - result data from the sender
 * @returns {object} return status and code
 */
async function postProcess (params, result) {
  const logger = Core.Logger('customer-commerce-created', { level: params.LOG_LEVEL || 'info' })
  try {
    const response = await updateCustomer(
      params.COMMERCE_BASE_URL,
      params.COMMERCE_CONSUMER_KEY,
      params.COMMERCE_CONSUMER_SECRET,
      params.COMMERCE_ACCESS_TOKEN,
      params.COMMERCE_ACCESS_TOKEN_SECRET,
      {
        customer: {
          id: params.data.id,
          custom_attributes: [
            {
              attribute_code: params.COMMERCE_HUBSPOT_CONTACT_ID_FIELD,
              value: result.contactId
            }
          ]
        }
      })

    logger.info('Customer update on commerce response: ', response)
    return {
      success: true,
      message: response
    }
  } catch (error) {
    return {
      success: false,
      statusCode: error.response?.statusCode || HTTP_INTERNAL_ERROR,
      message: error.message
    }
  }
}

module.exports = {
  postProcess
}
