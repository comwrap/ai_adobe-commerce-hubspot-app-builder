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

const { getCommerceOauthClient } = require('../oauth1a')
const { Core } = require('@adobe/aio-sdk')
const logger = Core.Logger('commerce-consumer-api-client', { level: 'info' })

/**
 * This function call Adobe commerce rest API to create a customer
 *
 * @returns {object} - API response object
 * @param {string} baseUrl - Adobe commerce rest api base url
 * @param {string} consumerKey - Adobe commerce integration consumer key
 * @param {string} consumerSecret - Adobe commerce integration consumer secret
 * @param {string} accessToken - Adobe commerce integration access token
 * @param {string} accessTokenSecret - Adobe commerce integration access token secret
 * @param {object} data - Adobe commerce api payload
 */
async function createCustomer (baseUrl, consumerKey, consumerSecret, accessToken, accessTokenSecret, data) {
  const client = getCommerceOauthClient(
    {
      url: baseUrl,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    },
    logger
  )

  return await client.post(
    'customers',
    JSON.stringify(data),
    '',
    { 'Content-Type': 'application/json' }
  )
}

/**
 * This function call Adobe commerce rest API to create a customer
 *
 * @returns {object} - API response object
 * @param {string} baseUrl - Adobe commerce rest api base url
 * @param {string} consumerKey - Adobe commerce integration consumer key
 * @param {string} consumerSecret - Adobe commerce integration consumer secret
 * @param {string} accessToken - Adobe commerce integration access token
 * @param {string} accessTokenSecret - Adobe commerce integration access token secret
 * @param {object} data - Adobe commerce api payload
 */
async function importCustomerBatch (baseUrl, consumerKey, consumerSecret, accessToken, accessTokenSecret, data) {
  const client = getCommerceOauthClient(
    {
      url: baseUrl,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    },
    logger
  )

  const jsonImport = {
    source: {
      allowed_error_count: 0,
      entity: 'customer',
      behavior: 'add_update',
      validation_strategy: 'validation-stop-on-errors',
      items: data
    }
  }

  return await client.post(
    'import/json',
    JSON.stringify(jsonImport),
    '',
    { 'Content-Type': 'application/json' }
  )
}

/**
 * This function call Adobe commerce rest API to update a customer
 *
 * @returns {object} - API response object
 * @param {string} baseUrl - Adobe commerce rest api base url
 * @param {string} consumerKey - Adobe commerce integration consumer key
 * @param {string} consumerSecret - Adobe commerce integration consumer secret
 * @param {string} accessToken - Adobe commerce integration access token
 * @param {string} accessTokenSecret - Adobe commerce integration access token secret
 * @param {object} data - Adobe commerce api payload
 */
async function updateCustomer (baseUrl, consumerKey, consumerSecret, accessToken, accessTokenSecret, data) {
  const client = getCommerceOauthClient(
    {
      url: baseUrl,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    },
    logger
  )

  return await client.put(
      `customers/${data.customer.id}`,
      JSON.stringify(data),
      '',
      { 'Content-Type': 'application/json' }
  )
}

/**
 * This function call Adobe commerce rest API to delete a customer
 *
 * @returns {object} - API response object
 * @param {string} baseUrl - Adobe commerce rest api base url
 * @param {string} consumerKey - Adobe commerce integration consumer key
 * @param {string} consumerSecret - Adobe commerce integration consumer secret
 * @param {string} accessToken - Adobe commerce integration access token
 * @param {string} accessTokenSecret - Adobe commerce integration access token secret
 * @param {number} id - Id
 */
async function deleteCustomer (baseUrl, consumerKey, consumerSecret, accessToken, accessTokenSecret, id) {
  const client = getCommerceOauthClient(
    {
      url: baseUrl,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    },
    logger
  )
  return await client.delete(`customers/${id}`)
}

/**
 * This function calls Adobe commerce rest API to get a customer
 *
 * @returns {object} - API response object
 * @param {string} baseUrl - Adobe commerce rest api base url
 * @param {string} consumerKey - Adobe commerce integration consumer key
 * @param {string} consumerSecret - Adobe commerce integration consumer secret
 * @param {string} accessToken - Adobe commerce integration access token
 * @param {string} accessTokenSecret - Adobe commerce integration access token secret
 * @param {object} customerId - Adobe commerce customer ID
 */
async function getCustomer (baseUrl, consumerKey, consumerSecret, accessToken, accessTokenSecret, customerId) {
  const client = getCommerceOauthClient(
    {
      url: baseUrl,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    },
    logger
  )

  return await client.get(
        `customers/${customerId}`,
        ''
  )
}

/**
 * This function calls Adobe commerce rest API to get a customer
 *
 * @returns {object} - API response object
 * @param {string} baseUrl - Adobe commerce rest api base url
 * @param {string} consumerKey - Adobe commerce integration consumer key
 * @param {string} consumerSecret - Adobe commerce integration consumer secret
 * @param {string} accessToken - Adobe commerce integration access token
 * @param {string} accessTokenSecret - Adobe commerce integration access token secret
 * @param {string} searchCriteria - Adobe commerce search criteria
 */
async function getCustomerBySearchCriteria (
  baseUrl,
  consumerKey,
  consumerSecret,
  accessToken,
  accessTokenSecret,
  searchCriteria) {
  const client = getCommerceOauthClient(
    {
      url: baseUrl,
      consumerKey,
      consumerSecret,
      accessToken,
      accessTokenSecret
    },
    logger
  )

  logger.info(`searchCriteria: ${searchCriteria}`)
  return await client.get(
        `customers/search?${searchCriteria}`,
        ''
  )
}

module.exports = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomer,
  getCustomerBySearchCriteria,
  importCustomerBatch
}
