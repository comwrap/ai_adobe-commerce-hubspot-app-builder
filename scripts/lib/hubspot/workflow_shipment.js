const fetch = require('node-fetch')
const uuid = require('uuid')

exports.main = async (event, callback) => {
  /*****
    Use inputs to get data from any action in your workflow and use it in your code instead of having to use the HubSpot API.
  *****/
  const orderId = event.object.objectId

  const eventType = 'be-observer.sales_order_shipment_create'
  const authUrl = 'https://ims-na1.adobelogin.com/ims/token/v3'
  const clientId = process.env.clientId // Replace with your actual client ID
  const providerId = process.env.providerId // Replace with your actual client ID
  const clientSecret = process.env.clientSecret // Replace with your actual client secret
  const scope = 'AdobeID,openid,read_organizations,additional_info.projectedProductContext,additional_info.roles,adobeio_api,read_client_secret,manage_client_secrets,event_receiver_api'

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope
  })

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })

  if (!response.ok) {
    console.log(response.message)
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  const hsShippingTrackingNumber = event.inputFields.hs_shipping_tracking_number
  const hsExternalOrderId = event.inputFields.hs_external_order_id

  const url = 'https://eventsingress.adobe.io'
  const options = {
    method: 'POST',
    headers: {
      'x-api-key': clientId,
      'Content-Type': 'application/cloudevents+json',
      Authorization: 'Bearer ' + data.access_token
    },
    body: JSON.stringify({
      datacontenttype: 'application/json',
      specversion: '1.0',
      source: 'urn:uuid:' + providerId,
      type: eventType,
      id: uuid.v4(),
      data: {
        id: orderId,
        trackingNumber: hsShippingTrackingNumber,
        incrementId: hsExternalOrderId
      }
    })
  }

  fetch(url, options)
    .then(res => res)
    .catch(err => console.error('error:' + err))

  callback(null, {
    outputFields: {
      orderId
    }
  })
}
