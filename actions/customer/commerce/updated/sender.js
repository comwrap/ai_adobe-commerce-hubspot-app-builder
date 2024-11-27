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
const { updateContact, getCompanyIdByExternalId} = require('../../hubspot-api-client')
const { Core } = require('@adobe/aio-sdk')
/**
 * This function send the customer updated dara to the external back-office application
 *
 * @param {object} params - include the env params
 * @param {object} preProcessed - result of the pre-process logic if any
 * @returns {object} returns the sending result if needed for post process
 */
async function sendData (params, preProcessed) {
  const logger = Core.Logger('customer-commerce-updated', { level: params.LOG_LEVEL || 'info' })
  try {
    const contactId = params.data[params.COMMERCE_HUBSPOT_CONTACT_ID_FIELD]
    let companyId = null
    logger.debug('Contact Id to update ', contactId)
    if (params.data.hasOwnProperty('company_attributes') && params.data.company_attributes.company_id !== 0) {
      companyId = await getCompanyIdByExternalId(params.HUBSPOT_ACCESS_TOKEN, params.data.company_attributes.company_id)
    }
    const response = await updateContact(params.HUBSPOT_ACCESS_TOKEN, preProcessed, contactId, companyId)
    logger.debug('Hubspot response: ', response)
    logger.debug('Contact id:', response.id)

    return {
      success: true,
      contactId: response.id
    }
  } catch (e) {
    logger.error('There was an error updating Contact in HubSpot')
    logger.error('Error ', e)
    e.message === 'HTTP request failed'
      ? logger.error(JSON.stringify(e.response, null, 2))
      : logger.error(e)
    return {
      success: false,
      statusCode: 400,
      message: e
    }
  }
}

module.exports = {
  sendData
}
