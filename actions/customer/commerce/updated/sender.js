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
const {updateContact} = require("../../hubspot-api-client");
const {Core} = require("@adobe/aio-sdk");
/**
 * This function send the customer updated dara to the external back-office application
 *
 * @param {object} params - include the env params
 * @param {object} data - Customer data
 * @param {object} preProcessed - result of the pre-process logic if any
 * @returns {object} returns the sending result if needed for post process
 */
async function sendData (params, data, preProcessed) {
  // @TODO Here add the logic to send the information to 3rd party
  // @TODO Use params to retrieve need parameters from the environment
  // @TODO in case of error return { success: false, statusCode: <error status code>, message: '<error message>' }
  const logger = Core.Logger('customer-commerce-updated', {level: params.LOG_LEVEL || 'info'})
  try {
      const response = await updateContact(params.HUBSPOT_ACCESS_TOKEN, data, params.COMMERCE_HUBSPOT_CONTACT_ID_FIELD)
      logger.debug('Hubspot response: ', response)
      logger.debug('Contact id:', response.id)

      return {
          success: true,
          contactId: response.id
      }

  } catch (e) {
      logger.error('There was an error updating Contact in HubSpot')
      return {
          success: false,
          statusCode: 400,
          message: e.response
      }
  }
}

module.exports = {
  sendData
}
