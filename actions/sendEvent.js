const { CloudEvent } = require('cloudevents')
const uuid = require('uuid')
const { getAdobeAccessToken } = require('../utils/adobe-auth')
const { Events } = require('@adobe/aio-sdk')
const { getProviderByKey } = require('../utils/adobe-events-api')
const { BACKOFFICE_PROVIDER_KEY } = require('./constants')

/**
 * @param {object} params - Adobe I/O Runtime params
 * @param {object} payload - event payload
 * @param {string} eventType - event type
 * @param {object} logger - logger
 * @returns {Promise<string>} - Returns the result of the event publishing
 */
async function sendEvent (params, payload, eventType, logger) {
  const accessToken = await getAdobeAccessToken(params)
  const eventsClient = await Events.init(
    params.OAUTH_ORG_ID,
    params.OAUTH_CLIENT_ID,
    accessToken)
  const provider = await getProviderByKey(params, accessToken, BACKOFFICE_PROVIDER_KEY)

  const cloudEvent = new CloudEvent({
    source: 'urn:uuid:' + provider.id,
    type: eventType,
    datacontenttype: 'application/json',
    data: payload,
    id: uuid.v4()
  })

  logger.debug(`Publish event ${eventType} to provider ${provider.label}`)
  const publishEventResult = await eventsClient.publishEvent(cloudEvent)
  logger.debug(`Publish event result: ${publishEventResult}`)

  return publishEventResult
}

module.exports = {
  sendEvent
}
