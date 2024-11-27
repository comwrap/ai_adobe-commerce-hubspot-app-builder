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
const { sendEvent } = require('../../../sendEvent')
const { getContactsPage } = require('../../hubspot-api-client')
const { checkMissingRequestInputs } = require('../../../utils')

/**
 * This is the consumer of the events coming from External back-office applications related to product entity.
 *
 * @returns {object} returns response object with status code, request data received and response of the invoked action
 * @param {object} params - includes the env params, type and the data of the event
 */
async function main (params) {
  const logger = Core.Logger('customer-external-full-import', { level: params.LOG_LEVEL || 'info' })

  const statusCode = HTTP_OK

  logger.info('Start full batch import contacts')
  try {
    // check for missing request input parameters and headers
    const requiredParams = ['batchSize']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, [])
    if (errorMessage) {
      logger.error(`Invalid request parameters: ${errorMessage}`)
      return errorResponse(HTTP_BAD_REQUEST, `Invalid request parameters: ${errorMessage}`)
    }

    const batchSize = params.batchSize
    let after
    let counter = 0
    let total = 0
    let batchPayload = []

    do {
      const contactsPage = await getContactsPage(params.HUBSPOT_ACCESS_TOKEN, batchSize, after)

      // clear Payload and counter
      // eslint-disable-next-line
      counter = 0
      batchPayload = []

      contactsPage.results.forEach(contact => {
        const customPayload = {
          firstname: contact.properties.firstname,
          lastname: contact.properties.lastname,
          email: contact.properties.email,
          contact_id: contact.id,
          group_id: params.HUBSPOT_FULL_IMPORT_CONTACT_GROUP_ID,
          _website: params.HUBSPOT_FULL_IMPORT_CONTACT_WEBSITE
        }
        batchPayload.push(customPayload)
        counter++
        total++
      })

      // Publish the batch event
      const eventType = 'be-observer.contacts.batch'
      const publishEventResult = await sendEvent(params, batchPayload, eventType, logger)
      if (publishEventResult !== PUBLISH_EVENT_SUCCESS) {
        logger.error(`Unable to publish event ${eventType}: Unknown event type`)
        return errorResponse(HTTP_BAD_REQUEST, `Unable to publish event ${eventType}: Unknown event type`)
      }

      // Update the `after` cursor for the next page
      after = contactsPage.paging?.next?.after || null
    } while (after) // Continue until there are no more pages

    logger.info(`Successful request: ${statusCode}`)
    return successResponse(params.type, `Successfully exported batch events to load ${total} Contacts`)
  } catch (error) {
    logger.error(`Server error: ${error.message}`)
    return errorResponse(HTTP_INTERNAL_ERROR, error.message)
  }
}

exports.main = main
