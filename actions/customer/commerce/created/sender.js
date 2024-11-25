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

const {createContact} = require("../../hubspot-api-client");
const {Core} = require("@adobe/aio-sdk");

/**
 * This function send the customer created dara to the external back-office application
 *
 * @param {object} params - include the env params
 * @param {object} data - Customer data
 * @param {object} preProcessed - result of the pre-process logic if any
 * @returns {object} returns the sending result if needed for post process
 */
async function sendData(params, data, preProcessed) {
    const logger = Core.Logger('customer-commerce-created', {level: params.LOG_LEVEL || 'info'})
    try {
        const response = await createContact(params.HUBSPOT_ACCESS_TOKEN, data)
        logger.debug('Hubspot response: ', response)
        logger.debug('Contact id:', response.id)

        return {
            success: true,
            contactId: response.id
        }

    } catch (e) {
        logger.error('There was an error creating Contact in HubSpot')
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
