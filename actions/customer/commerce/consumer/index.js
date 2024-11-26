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

const { Core } = require('@adobe/aio-sdk')
const { stringParameters, checkMissingRequestInputs } = require('../../../utils')
const { errorResponse, successResponse, actionSuccessResponse} = require('../../../responses')
const { HTTP_BAD_REQUEST, HTTP_OK, HTTP_INTERNAL_ERROR } = require('../../../constants')
const Openwhisk = require('../../../openwhisk')
const stateLib = require('@adobe/aio-lib-state')
const {isAPotentialInfiniteLoop, storeFingerPrint} = require('../../../infiniteLoopCircuitBreaker');
const { getCompanyIdByExternalId } = require('../../hubspot-api-client')

/**
 * This is the consumer of the events coming from Adobe Commerce related to customer entity.
 *
 * @returns {object} returns response object with status code, request data received and response of the invoked action
 * @param {object} params - includes the env params, type and the data of the event
 */
async function main (params) {
  const logger = Core.Logger('customer-commerce-consumer', { level: params.LOG_LEVEL || 'info' })

  // Create a state instance
  const state = await stateLib.init()

  try {
    const openwhiskClient = new Openwhisk(params.API_HOST, params.API_AUTH)

    let response = {}
    let statusCode = HTTP_OK

    logger.info('Start processing request')
    logger.debug(`Consumer main params: ${stringParameters(params)}`)

    const requiredParams = ['type']
    const errorMessage = checkMissingRequestInputs(params, requiredParams, [])

    if (errorMessage) {
      logger.error(`Invalid request parameters: ${errorMessage}`)
      return errorResponse(HTTP_BAD_REQUEST, `Invalid request parameters: ${errorMessage}`)
    }

    logger.info('Params type: ', params.type)

    // Detect infinite loop and break it
    const infiniteLoopEventTypes = [
      'com.adobe.commerce.observer.customer_save_commit_after'
    ]
    const infiniteLoopKey = `customer_${params.data.value.email}`
    const fingerPrintData = { email: params.data.value.email }
    if (await isAPotentialInfiniteLoop(state, infiniteLoopKey, fingerPrintData, infiniteLoopEventTypes, params.type)) {
      logger.info(`Infinite loop break for customer ${params.data.email}`)
      return successResponse(params.type, 'event discarded to prevent infinite loop')
    }

    switch (params.type) {
      case 'com.adobe.commerce.observer.customer_save_commit_after': {
        const requiredParams = [
          'data.value.created_at',
          'data.value.updated_at']
        const errorMessage = checkMissingRequestInputs(params, requiredParams,
          [])
        if (errorMessage) {
          logger.error(`Invalid request parameters: ${errorMessage}`)
          return errorResponse(HTTP_BAD_REQUEST, `Invalid request parameters: ${errorMessage}`)
        }

        const contactIdField  = params.COMMERCE_HUBSPOT_CONTACT_ID_FIELD;

        if (params.data.value.id && (!params.data.value.hasOwnProperty(contactIdField)
            || (params.data.value.hasOwnProperty(contactIdField) && params.data.value[contactIdField] !== ""))) {
          logger.info('Invoking created customer')
          const res = await openwhiskClient.invokeAction(
              'customer-commerce/created', params.data.value)
          response = res?.response?.result?.body
          statusCode = res?.response?.result?.statusCode
        } else if (params.data.value.id && params.data.value.hasOwnProperty(contactIdField)) {
          logger.info('Invoking update customer')
          const res = await openwhiskClient.invokeAction(
            'customer-commerce/updated', params.data.value)
          response = res?.response?.result?.body
          statusCode = res?.response?.result?.statusCode
        } else {
          logger.info('Discarding customer saved event without customer Id')
          return actionSuccessResponse('Discarding customer saved event without customer Id')
        }
        break
      }
      case "com.adobe.commerce.observer.company_save_commit_after":
        //check in hubspot if the company already exist
        const companyHubspotId = await getCompanyIdByExternalId(params.HUBSPOT_ACCESS_TOKEN, params.data.value.entity_id);
        logger.info('companyHubspotId:' + companyHubspotId);
        params.data.value.hubspotId = companyHubspotId;
        if (companyHubspotId == null) {
          logger.info('Invoking created company')
          const res = await openwhiskClient.invokeAction(
              'customer-commerce/company-created', params.data.value)
          response = res?.response?.result?.body
          statusCode = res?.response?.result?.statusCode
        } else {
          logger.info('Invoking update company')
          const res = await openwhiskClient.invokeAction(
              'customer-commerce/company-updated', params.data.value)
          response = res?.response?.result?.body
          statusCode = res?.response?.result?.statusCode
        }
        break;
      default:
        logger.error(`Event type not found: ${params.type}`)
        return errorResponse(HTTP_BAD_REQUEST, `This case type is not supported: ${params.type}`)
    }

    if (!response.success) {
      logger.error(`Error response: ${response.error}`)
      return errorResponse(statusCode, response.error)
    }

    // Prepare to detect infinite loop on subsequent events
    await storeFingerPrint(state, infiniteLoopKey, fingerPrintData)

    logger.info(`Successful request: ${statusCode}`)
    return successResponse(params.type, response)
  } catch (error) {
    logger.error(`Server error: ${error.message}`)
    return errorResponse(HTTP_INTERNAL_ERROR, `Server error: ${error.message}`)
  }
}

exports.main = main
