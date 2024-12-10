const fetch = require('node-fetch')
const uuid = require('uuid')

/* eslint-disable */
exports.main = async (event, callback) => {
  /*****
    Use inputs to get data from any action in your workflow and use it in your code instead of having to use the HubSpot API.
  *****/
  const customerId = event.object.objectId

  const eventType = 'be-observer.customer_update'
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
        id: customerId,
        firstname: event.inputFields.firstname,
        lastname: event.inputFields.lastname,
        email: event.inputFields.email,
        city: event.inputFields.city,
        country: event.inputFields.country,
        zip: event.inputFields.zip,
        address: event.inputFields.address,
        state: event.inputFields.state
      }
    })
  }

  fetch(url, options)
    .then(res => res)
    .catch(err => console.error('error:' + err))

  callback({
    outputFields: {
      customerId
    }
  })
}
/* eslint-enable */
