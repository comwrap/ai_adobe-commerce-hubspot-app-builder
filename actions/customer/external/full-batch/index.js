/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License")
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Core } = require('@adobe/aio-sdk')
const { HTTP_INTERNAL_ERROR, HTTP_BAD_REQUEST, HTTP_OK, PUBLISH_EVENT_SUCCESS } = require('../../../constants')
const { errorResponse, successResponse } = require('../../../responses')
const uuid = require('uuid')
const { sendEvent } = require('../../../sendEvent')
const { getAllContacts} = require("../../hubspot-api-client");

/**
 * This is the consumer of the events coming from External back-office applications related to product entity.
 *
 * @returns {object} returns response object with status code, request data received and response of the invoked action
 * @param {object} params - includes the env params, type and the data of the event
 */
async function main (params) {
  const logger = Core.Logger('customer-external-full-btach', { level: params.LOG_LEVEL || 'info' })

  const statusCode = HTTP_OK
  const amountOfProductsToFetch = 10

  logger.info('Start full batch import contacts')
  try {
    const fetchedContacts = await getAllContacts(params.HUBSPOT_ACCESS_TOKEN);

    logger.info('# Contacts fetched from Hubspot', fetchedContacts.length)

    const eventType = 'be-observer.contacts.batch'
    const jobId = uuid.v4()

    let counter = 0
     let total = 0
    const batchSize = 50
    let batchPayload = []


    for (const contact of fetchedContacts) {

      const customPayload = {
        name: contact.response.properties.firstname,
        lastname: contact.response.properties.lastname,
        email: contact.response.properties.email
      }
      batchPayload.push(customPayload)
      counter++
      total++

      if (counter === batchSize) {
        const publishEventResult = await sendEvent(params, batchPayload, eventType, logger)

        if (publishEventResult !== PUBLISH_EVENT_SUCCESS) {
          logger.error(`Unable to publish event ${eventType}: Unknown event type`)
          return errorResponse(HTTP_BAD_REQUEST, `Unable to publish event ${eventType}: Unknown event type`)
        }

        // clear Payload and counter
        counter = 0
        batchPayload = []
      }
    }

    if (batchPayload.length > 0) {
      const publishEventResult = await sendEvent(params, batchPayload, eventType, logger)

      if (publishEventResult !== PUBLISH_EVENT_SUCCESS) {
        logger.error(`Unable to publish event ${eventType}: Unknown event type`)
        return errorResponse(HTTP_BAD_REQUEST, `Unable to publish event ${eventType}: Unknown event type`)
      }
    }

    // TODO implement a logic to check if there were errors

    logger.info(`Successful request: ${statusCode}`)
    return successResponse(params.type, `Successfully exported batch events to load ${total} Contacts`)
  } catch (error) {
    logger.error(`Server error: ${error.message}`)
    return errorResponse(HTTP_INTERNAL_ERROR, error.message)
  }
}

exports.main = main
